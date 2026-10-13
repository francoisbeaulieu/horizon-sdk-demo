import type {
  AgentStatus,
  CallActivity,
  PresenceChange,
  QueueStats,
  RemoteAppSDK,
  StreamStatus,
} from '@netsapiens/flow-sdk';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useFlowContext, useStream } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

/**
 * Live Operations — a wallboard built entirely on `sdk.streams`.
 *
 * Four live feeds, each opened with `useStream`, which subscribes on mount,
 * closes on unmount and returns the subscription's status:
 *
 *   - Queue stats       `streams.queues.onDomainQueues({ stats })`
 *   - Agents            `streams.queues.onDomainQueues({ agentUpdated, … })`
 *   - Live domain calls `streams.calls.onDomainCalls({ updated, ended })`
 *   - Presence          `streams.presence.onDomain(update)`
 *
 * What it is here to show, beyond the data:
 *
 *   - **Status is part of the UI.** Every card prints its stream's status. A
 *     `refused` stream is not an error to swallow: its `message` is written by
 *     the host for the user, and saying "your scope does not allow live calls"
 *     is better than an empty card. The domain-calls card is refused for anyone
 *     below Office Manager, which is the point — sign in as a Basic User and
 *     watch it say so.
 *   - **`live.snapshot`.** When the host already holds records for a feed it
 *     replays them first (`snapshot: true`). When it does not, the card starts
 *     empty and fills as things change; a real board would seed from the API.
 *   - **One feed per need.** Queue stats and agents are two subscriptions to
 *     the same method with different handlers. The host shares the socket room
 *     between them, so asking twice costs nothing — and each card owns its own
 *     lifecycle.
 *   - **Grants come from the bundle.** Nothing here names a permission. The
 *     platform reads these calls out of the bundle when it is submitted and
 *     asks an operator to approve `queues`, `calls.domain` and `presence`.
 */

interface LiveOperationsPageProps extends ZoneMarkerProps {
  /** The app's SDK instance, handed down by App.tsx. Pages have no other way to it. */
  sdk: RemoteAppSDK;
}

/** Upsert into a keyed map held in state, returning a new map. */
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

function fmtSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(h ? 2 : 1, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Seconds since an ISO time, against a ticking `now`. */
function since(iso: string | null, now: number): number {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : (now - t) / 1000;
}

/** A one-second clock, so durations count without new frames. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

type Ui = NonNullable<ReturnType<typeof useFlowContext>['ui']>;

/** The status line every card carries. */
function StatusLine({
  ui,
  status,
  call,
}: {
  ui: Ui;
  status: StreamStatus;
  call: string;
}) {
  const { Stack, Typography, Chip } = ui;
  if (!Stack || !Typography || !Chip) return null;
  const label =
    status.state === 'live'
      ? status.snapshot
        ? 'live · snapshot replayed'
        : 'live · filling as things change'
      : status.state;
  const color =
    status.state === 'live'
      ? 'success'
      : status.state === 'refused'
        ? 'error'
        : status.state === 'pending'
          ? 'default'
          : 'warning';
  return (
    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
      <Chip size='small' label={label} color={color} variant='outlined' />
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ fontFamily: 'monospace' }}
      >
        {call}
      </Typography>
    </Stack>
  );
}

/** A card that shows its stream's refusal or unavailability in place of data. */
function StreamCard({
  ui,
  title,
  call,
  status,
  empty,
  children,
  testId,
}: {
  ui: Ui;
  title: string;
  call: string;
  status: StreamStatus;
  empty: string;
  children: ReactNode;
  testId: string;
}) {
  const { Paper, Stack, Typography, Alert, Divider } = ui;
  if (!Paper || !Stack || !Typography || !Alert || !Divider) return null;
  return (
    <Paper
      sx={{ p: 3, flex: '1 1 360px', minWidth: 0 }}
      data-testid={testId}
      data-state={status.state}
    >
      <Stack spacing={1.5}>
        <Typography variant='h6'>{title}</Typography>
        <StatusLine ui={ui} status={status} call={call} />
        <Divider />
        {status.state === 'refused' ? (
          // Written by the host for the user: show it as-is.
          <Alert severity='info'>{status.message}</Alert>
        ) : status.state === 'unavailable' ? (
          <Alert severity='warning'>
            The live connection dropped
            {status.retrying ? '; reconnecting…' : '.'}
          </Alert>
        ) : status.state === 'unconfirmed' ? (
          <Alert severity='warning'>
            This host did not answer the stream request. It may predate
            sdk.streams.
          </Alert>
        ) : children ? (
          children
        ) : (
          <Typography variant='body2' color='text.secondary'>
            {empty}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function LiveOperationsPage({
  sdk,
  ...marker
}: LiveOperationsPageProps) {
  const { ui } = useFlowContext();
  const { PageTemplate } = ui?.templates || {};
  const { Stack, Typography, Chip } = ui || {};
  const now = useNow();

  // ── Queue stats ────────────────────────────────────────────────────────────
  const [queues, setQueues] = useState(new Map<string, QueueStats>());
  const queueStatus = useStream(
    sdk,
    (streams) =>
      streams.queues.onDomainQueues({
        stats: (q) => setQueues((m) => upsert(m, q.queue, q)),
      }),
    [],
  );

  // ── Agents ─────────────────────────────────────────────────────────────────
  // The same method again with other handlers: the host opens only the feeds a
  // subscription has handlers for, and shares the room with the one above.
  const [agents, setAgents] = useState(new Map<string, AgentStatus>());
  const agentKey = (a: AgentStatus) => `${a.queue}|${a.agent}`;
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

  // ── Live calls across the domain ──────────────────────────────────────────
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

  // ── Presence ───────────────────────────────────────────────────────────────
  const [presence, setPresence] = useState(new Map<string, PresenceChange>());
  const presenceStatus = useStream(
    sdk,
    (streams) =>
      streams.presence.onDomain((p) =>
        setPresence((m) => upsert(m, p.user, p)),
      ),
    [],
  );

  if (!ui || !PageTemplate || !Stack || !Typography || !Chip) return null;

  const queueRows = [...queues.values()].sort((a, b) =>
    a.queue.localeCompare(b.queue),
  );
  const agentRows = [...agents.values()].sort(
    (a, b) => a.queue.localeCompare(b.queue) || a.user.localeCompare(b.user),
  );
  const callRows = [...calls.values()].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );
  const presenceCounts = [...presence.values()].reduce<Record<string, number>>(
    (acc, p) => {
      const key = p.presence || 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <PageTemplate
      {...marker}
      title='Live Operations'
      subtitle='Queues, agents, calls and presence — pushed by sdk.streams, no polling.'
    >
      <Stack spacing={3}>
        <Stack direction='row' spacing={3} useFlexGap flexWrap='wrap'>
          <StreamCard
            ui={ui}
            title='Queues'
            call='queues.onDomainQueues({ stats })'
            status={queueStatus}
            empty='No queue activity yet.'
            testId='sdk-demo-live-ops-queues'
          >
            {queueRows.length > 0 && (
              <Stack spacing={1}>
                {queueRows.map((q) => (
                  <Stack
                    key={q.queue}
                    direction='row'
                    justifyContent='space-between'
                  >
                    <Typography variant='body2'>{q.queue}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {q.waiting} waiting · longest{' '}
                      {fmtSeconds(q.longestWaitSec)} · {q.agentsAvailable}/
                      {q.agentsLoggedIn} agents free
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </StreamCard>

          <StreamCard
            ui={ui}
            title='Agents'
            call='queues.onDomainQueues({ agentUpdated, agentAdded, agentRemoved })'
            status={agentStatus}
            empty='No agent changes yet.'
            testId='sdk-demo-live-ops-agents'
          >
            {agentRows.length > 0 && (
              <Stack spacing={1}>
                {agentRows.map((a) => (
                  <Stack
                    key={agentKey(a)}
                    direction='row'
                    justifyContent='space-between'
                  >
                    <Typography variant='body2'>
                      {a.user} · {a.queue}
                    </Typography>
                    <Chip
                      size='small'
                      label={
                        a.activeCalls > 0 ? `${a.status} · on call` : a.status
                      }
                      color={a.status === 'available' ? 'success' : 'default'}
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </StreamCard>
        </Stack>

        <StreamCard
          ui={ui}
          title='Live calls in the domain'
          call='calls.onDomainCalls({ updated, ended })'
          status={callStatus}
          empty='No calls in progress.'
          testId='sdk-demo-live-ops-calls'
        >
          {callRows.length > 0 && (
            <Stack spacing={1}>
              {callRows.map((c) => (
                <Stack
                  key={c.callId}
                  direction='row'
                  justifyContent='space-between'
                >
                  <Typography variant='body2'>
                    {c.from.name || c.from.user || c.from.number} →{' '}
                    {c.to.name || c.to.user || c.to.number}
                    {c.through
                      ? ` (via ${c.through.name || c.through.user})`
                      : ''}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {c.state} ·{' '}
                    {fmtSeconds(since(c.answeredAt ?? c.startedAt, now))}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </StreamCard>

        <StreamCard
          ui={ui}
          title='Presence'
          call='presence.onDomain(update)'
          status={presenceStatus}
          empty='No presence changes yet. Change your status in the top bar to see one.'
          testId='sdk-demo-live-ops-presence'
        >
          {presence.size > 0 && (
            <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
              {Object.entries(presenceCounts).map(([state, n]) => (
                <Chip key={state} label={`${n} ${state}`} />
              ))}
            </Stack>
          )}
        </StreamCard>
      </Stack>
    </PageTemplate>
  );
}
