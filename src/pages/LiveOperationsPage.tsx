import type {
  ActivityRow,
  AgentStatus,
  CallActivity,
  DashboardTemplateWidget,
  DashboardTemplateWidgetProps,
  PresenceChange,
  QueueStats,
  RemoteAppSDK,
  StreamStatus,
} from '@netsapiens/flow-sdk';
import type { ComponentType, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useFlowContext, useStream } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

/**
 * Live Operations — a wallboard built entirely on `sdk.streams`, drawn entirely
 * with the host's kit.
 *
 * Four live feeds, each opened once with `useStream` (subscribes on mount,
 * closes on unmount, returns the subscription's status):
 *
 *   - Queue stats       `streams.queues.onDomainQueues({ stats })`
 *   - Agents            `streams.queues.onDomainQueues({ agentUpdated, … })`
 *   - Live domain calls `streams.calls.onDomainCalls({ updated, ended })`
 *   - Presence          `streams.presence.onDomain(update)`
 *
 * The page is a `DashboardTemplate`: the host draws the header, the grid and
 * every card frame, exactly as on its own dashboards. The cards' bodies are kit
 * components too — `StatBlock` leaves for the headline numbers, `ActivityList`
 * for the feeds, `Donut` for presence, `Alert`/`Chip` for stream status. Nothing
 * here is hand-rolled markup.
 *
 * The streams are opened ONCE, by the provider above the template, and the cards
 * read them from context. The host mounts and remounts card bodies as it lays
 * the grid out; subscribing inside a card would open and close the feed with it.
 *
 * What the page is there to show, beyond the data:
 *
 *   - **Status is part of the UI.** Every card shows its stream's status. A
 *     `refused` stream carries a message the host wrote for the user — the
 *     domain-calls card is refused for anyone below Office Manager, and says
 *     so instead of sitting empty.
 *   - **`live.snapshot`.** When the host already held records for a feed it
 *     replays them first; when not, the card fills as things change.
 *   - **One feed per need.** Queue stats and agents are two subscriptions to
 *     the same method with different handlers. The host shares the socket room
 *     between them, so asking twice costs nothing.
 *   - **Grants come from the bundle.** Nothing here names a permission. The
 *     platform reads these calls out of the bundle when a version is submitted
 *     and derives `queues`, `calls.domain` and `presence` from them.
 */

interface LiveOperationsPageProps extends ZoneMarkerProps {
  /** The app's SDK instance, handed down by App.tsx. Pages have no other way to it. */
  sdk: RemoteAppSDK;
}

// ── State ────────────────────────────────────────────────────────────────────

interface LiveState {
  queues: QueueStats[];
  queueStatus: StreamStatus;
  agents: AgentStatus[];
  agentStatus: StreamStatus;
  calls: CallActivity[];
  callStatus: StreamStatus;
  presence: PresenceChange[];
  /** Most recent first, for the change feed. */
  presenceLog: PresenceChange[];
  presenceStatus: StreamStatus;
  /** A one-second clock, so call durations count between frames. */
  now: number;
}

const LiveContext = createContext<LiveState | null>(null);

function useLive(): LiveState {
  const state = useContext(LiveContext);
  if (!state)
    throw new Error('Live Operations card rendered outside its provider');
  return state;
}

function upsert<T>(map: Map<string, T>, key: string, value: T): Map<string, T> {
  const next = new Map(map);
  next.set(key, value);
  return next;
}

function without<T>(map: Map<string, T>, key: string): Map<string, T> {
  const next = new Map(map);
  next.delete(key);
  return next;
}

const agentKey = (a: AgentStatus) => `${a.queue}|${a.agent}`;

/** Opens the four feeds once and hands their data to every card below. */
function LiveProvider({
  sdk,
  children,
}: {
  sdk: RemoteAppSDK;
  children: ReactNode;
}) {
  const [queues, setQueues] = useState(new Map<string, QueueStats>());
  const queueStatus = useStream(
    sdk,
    (streams) =>
      streams.queues.onDomainQueues({
        stats: (q) => setQueues((m) => upsert(m, q.queue, q)),
      }),
    [],
  );

  // The same method again with other handlers: the host opens only the feeds a
  // subscription has handlers for, and shares the room with the one above.
  const [agents, setAgents] = useState(new Map<string, AgentStatus>());
  const agentStatus = useStream(
    sdk,
    (streams) =>
      streams.queues.onDomainQueues({
        agentUpdated: (a) => setAgents((m) => upsert(m, agentKey(a), a)),
        agentAdded: (a) => setAgents((m) => upsert(m, agentKey(a), a)),
        agentRemoved: (a) => setAgents((m) => without(m, agentKey(a))),
      }),
    [],
  );

  // Office Managers and Call Center Supervisors only; everyone else is refused
  // with a message the card shows as-is.
  const [calls, setCalls] = useState(new Map<string, CallActivity>());
  const callStatus = useStream(
    sdk,
    (streams) =>
      streams.calls.onDomainCalls({
        updated: (c) => setCalls((m) => upsert(m, c.callId, c)),
        ended: (c) => setCalls((m) => without(m, c.callId)),
      }),
    [],
  );

  const [presence, setPresence] = useState(new Map<string, PresenceChange>());
  const [presenceLog, setPresenceLog] = useState<PresenceChange[]>([]);
  const presenceStatus = useStream(
    sdk,
    (streams) =>
      streams.presence.onDomain((p) => {
        setPresence((m) => upsert(m, p.user, p));
        setPresenceLog((log) => [p, ...log].slice(0, 20));
      }),
    [],
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const state: LiveState = {
    queues: [...queues.values()].sort((a, b) => a.queue.localeCompare(b.queue)),
    queueStatus,
    agents: [...agents.values()].sort(
      (a, b) => a.queue.localeCompare(b.queue) || a.user.localeCompare(b.user),
    ),
    agentStatus,
    calls: [...calls.values()].sort((a, b) =>
      a.startedAt.localeCompare(b.startedAt),
    ),
    callStatus,
    presence: [...presence.values()],
    presenceLog,
    presenceStatus,
    now,
  };
  return <LiveContext.Provider value={state}>{children}</LiveContext.Provider>;
}

// ── Formatting ───────────────────────────────────────────────────────────────

function fmtSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(h ? 2 : 1, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function since(iso: string | null, now: number): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : (now - t) / 1000;
}

function party(p: CallActivity['from']): string {
  return p.name || p.user || p.number || 'Unknown';
}

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

// ── Stream status ────────────────────────────────────────────────────────────

const blocked = (s: StreamStatus) =>
  s.state === 'refused' ||
  s.state === 'unavailable' ||
  s.state === 'unconfirmed';

/**
 * What the stream is doing, in kit components: a status chip and the SDK call
 * while it is flowing; the host's own message in an Alert when it is not.
 */
function StreamNote({ status, call }: { status: StreamStatus; call: string }) {
  const { ui } = useFlowContext();
  const { Alert, Chip, Stack, Typography } = ui ?? {};
  if (!Alert || !Chip || !Stack || !Typography) return null;

  if (status.state === 'refused') {
    return <Alert severity='info'>{status.message}</Alert>;
  }
  if (status.state === 'unavailable') {
    return (
      <Alert severity='warning'>
        The live connection dropped{status.retrying ? '; reconnecting…' : '.'}
      </Alert>
    );
  }
  if (status.state === 'unconfirmed') {
    return (
      <Alert severity='warning'>
        This server did not answer the stream request. It may predate
        sdk.streams.
      </Alert>
    );
  }
  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      <Chip
        size='small'
        variant='outlined'
        color={status.state === 'live' ? 'success' : 'default'}
        label={
          status.state === 'live'
            ? status.snapshot
              ? 'Live · snapshot replayed'
              : 'Live'
            : 'Connecting…'
        }
      />
      <Typography variant='caption' color='text.secondary' noWrap>
        {call}
      </Typography>
    </Stack>
  );
}

/** A card body: the stream note, then the content unless the stream is blocked. */
function CardBody({
  status,
  call,
  children,
}: {
  status: StreamStatus;
  call: string;
  children: ReactNode;
}) {
  const { ui } = useFlowContext();
  const Stack = ui?.Stack;
  if (!Stack) return null;
  return (
    <Stack spacing={1.5}>
      <StreamNote status={status} call={call} />
      {blocked(status) ? null : children}
    </Stack>
  );
}

// ── Headline leaves ──────────────────────────────────────────────────────────

/** A StatBlock leaf, or a dash when the feed behind it is not available. */
function Stat({
  status,
  value,
  caption,
  tone,
}: {
  status: StreamStatus;
  value: number | string;
  caption: string;
  tone: Tone;
}) {
  const { ui } = useFlowContext();
  const StatBlock = ui?.StatBlock;
  if (!StatBlock) return null;
  const off = blocked(status);
  return (
    <StatBlock
      value={off ? '—' : value}
      caption={off ? 'Not available to you' : caption}
      tone={off ? 'neutral' : tone}
    />
  );
}

function WaitingStat() {
  const { queues, queueStatus } = useLive();
  const waiting = queues.reduce((n, q) => n + q.waiting, 0);
  const longest = queues.reduce((n, q) => Math.max(n, q.longestWaitSec), 0);
  return (
    <Stat
      status={queueStatus}
      value={waiting}
      caption={waiting ? `longest ${fmtSeconds(longest)}` : 'no one waiting'}
      tone={waiting > 0 ? 'warning' : 'success'}
    />
  );
}

function AgentsFreeStat() {
  const { queues, queueStatus } = useLive();
  const free = queues.reduce((n, q) => n + q.agentsAvailable, 0);
  const loggedIn = queues.reduce((n, q) => n + q.agentsLoggedIn, 0);
  return (
    <Stat
      status={queueStatus}
      value={free}
      caption={`of ${loggedIn} logged in`}
      tone={free > 0 ? 'success' : 'warning'}
    />
  );
}

function CallsStat() {
  const { calls, callStatus } = useLive();
  const active = calls.filter((c) => c.state === 'active').length;
  return (
    <Stat
      status={callStatus}
      value={calls.length}
      caption={`${active} connected`}
      tone='primary'
    />
  );
}

function AvailableStat() {
  const { presence, presenceStatus } = useLive();
  const open = presence.filter((p) => p.presence === 'open').length;
  return (
    <Stat
      status={presenceStatus}
      value={open}
      caption={`of ${presence.length} seen changing`}
      tone='info'
    />
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────

function QueuesCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { queues, queueStatus } = useLive();
  const ActivityList = ui?.ActivityList;
  if (!ActivityList) return null;
  const rows: ActivityRow[] = queues.map((q) => ({
    id: q.queue,
    primary: q.queue,
    secondary: `${q.agentsAvailable}/${q.agentsLoggedIn} agents free · ${q.activeCalls} on calls`,
    meta: q.waiting
      ? `${q.waiting} waiting · ${fmtSeconds(q.longestWaitSec)}`
      : 'none waiting',
    tone:
      q.waiting === 0
        ? 'success'
        : q.agentsAvailable === 0
          ? 'error'
          : 'warning',
  }));
  return (
    <CardBody status={queueStatus} call='queues.onDomainQueues({ stats })'>
      <ActivityList
        rows={rows}
        width={widget.pixel.width}
        emptyMessage='No queue activity yet.'
      />
    </CardBody>
  );
}

function AgentsCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { agents, agentStatus } = useLive();
  const ActivityList = ui?.ActivityList;
  if (!ActivityList) return null;
  const rows: ActivityRow[] = agents.map((a) => ({
    id: agentKey(a),
    primary: a.user,
    secondary: a.queue,
    meta: a.activeCalls > 0 ? `${a.status} · on a call` : a.status,
    tone:
      a.activeCalls > 0
        ? 'primary'
        : a.status === 'available'
          ? 'success'
          : 'neutral',
  }));
  return (
    <CardBody
      status={agentStatus}
      call='queues.onDomainQueues({ agentUpdated, agentAdded, agentRemoved })'
    >
      <ActivityList
        rows={rows}
        width={widget.pixel.width}
        emptyMessage='No agent changes yet.'
      />
    </CardBody>
  );
}

function CallsCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { calls, callStatus, now } = useLive();
  const ActivityList = ui?.ActivityList;
  if (!ActivityList) return null;
  const rows: ActivityRow[] = calls.map((c) => ({
    id: c.callId,
    primary: `${party(c.from)} → ${party(c.to)}`,
    secondary: c.through ? `via ${c.through.name || c.through.user}` : c.state,
    meta: fmtSeconds(since(c.answeredAt ?? c.startedAt, now)),
    tone:
      c.state === 'active'
        ? 'success'
        : c.state === 'held'
          ? 'warning'
          : 'info',
  }));
  return (
    <CardBody
      status={callStatus}
      call='calls.onDomainCalls({ updated, ended })'
    >
      <ActivityList
        rows={rows}
        width={widget.pixel.width}
        emptyMessage='No calls in progress.'
      />
    </CardBody>
  );
}

function presenceTone(state: string): Tone {
  return state === 'open'
    ? 'success'
    : state === 'inactive'
      ? 'neutral'
      : 'warning';
}

function PresenceCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { presence, presenceLog, presenceStatus } = useLive();
  const { ActivityList, Donut } = ui ?? {};
  if (!ActivityList || !Donut) return null;

  const counts = presence.reduce<Record<string, number>>((acc, p) => {
    const key = p.presence || 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <CardBody status={presenceStatus} call='presence.onDomain(update)'>
      {presence.length > 0 && (
        <Donut
          height={160}
          centerLabel={`${presence.length} seen`}
          slices={Object.entries(counts).map(([label, value]) => ({
            label,
            value,
            tone: presenceTone(label),
          }))}
        />
      )}
      <ActivityList
        width={widget.pixel.width}
        emptyMessage='No presence changes yet. Change your status in the top bar to see one.'
        rows={presenceLog.map((p, i) => ({
          id: `${p.user}-${i}`,
          primary: `${p.firstName} ${p.lastName}`.trim() || p.user,
          secondary: p.statusMessage ?? undefined,
          meta: p.presence,
          tone: presenceTone(p.presence),
        }))}
      />
    </CardBody>
  );
}

// ── The page ─────────────────────────────────────────────────────────────────

const leaf = (
  id: string,
  title: string,
  component: ComponentType<DashboardTemplateWidgetProps>,
) => ({ id, title, component });

/**
 * Declared once, at module scope: the template keys cards by id, and a new
 * component identity on every render would remount every card each second.
 */
const WIDGETS: DashboardTemplateWidget[] = [
  {
    id: 'live-ops-now',
    title: 'Right now',
    size: 'full',
    height: 3,
    refreshPolicy: 'realtime',
    leaves: [
      leaf('live-ops-waiting', 'Callers waiting', WaitingStat),
      leaf('live-ops-agents-free', 'Agents free', AgentsFreeStat),
      leaf('live-ops-calls', 'Calls in progress', CallsStat),
      leaf('live-ops-available', 'Available', AvailableStat),
    ],
  },
  {
    id: 'live-ops-queues',
    title: 'Queues',
    description: 'Waiting callers and free agents per queue',
    size: 'half',
    height: 5,
    refreshPolicy: 'realtime',
    component: QueuesCard,
  },
  {
    id: 'live-ops-agents',
    title: 'Agents',
    description: 'Agent state across the domain’s queues',
    size: 'half',
    height: 5,
    refreshPolicy: 'realtime',
    component: AgentsCard,
  },
  {
    id: 'live-ops-calls',
    title: 'Live calls in the domain',
    description: 'Domain admins only — everyone else sees the host’s refusal',
    size: 'full',
    height: 5,
    refreshPolicy: 'realtime',
    component: CallsCard,
  },
  {
    id: 'live-ops-presence',
    title: 'Presence',
    description: 'Changes as they happen; there is no starting snapshot',
    size: 'full',
    height: 5,
    refreshPolicy: 'realtime',
    component: PresenceCard,
  },
];

export default function LiveOperationsPage({
  sdk,
  ...marker
}: LiveOperationsPageProps) {
  const { ui } = useFlowContext();
  const DashboardTemplate = ui?.templates?.DashboardTemplate;
  const Box = ui?.Box;

  // Carve-out: without the kit there is no page to draw.
  if (!DashboardTemplate || !Box) {
    return (
      <div {...marker} style={{ padding: 24 }}>
        Dashboard template not available
      </div>
    );
  }

  return (
    // `Box`, not a bare div: the marker needs a root to ride on.
    <Box {...marker}>
      <LiveProvider sdk={sdk}>
        <DashboardTemplate
          title='Live Operations'
          subtitle='Queues, agents, calls and presence — pushed by sdk.streams, no polling.'
          widgets={WIDGETS}
        />
      </LiveProvider>
    </Box>
  );
}
