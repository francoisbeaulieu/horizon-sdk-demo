/**
 * Live Operations cards. Every one is drawn from kit components: StatBlock,
 * Chart, Donut, ActivityList, Table, Avatar, Chip, List, Tooltip, and the host's
 * empty state. Data comes from LiveProvider; nothing here subscribes.
 */
import type {
  ActivityRow,
  CallActivity,
  DashboardTemplateWidgetProps,
  FlowNotification,
  StreamStatus,
} from '@netsapiens/flow-sdk';
import { useContext } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import type { Tone } from './format';
import type { Sample } from './liveContext';
import { chipColor, fmtSeconds, initials, isBlocked, since } from './format';
import { agentKey, QueuePickContext, useLive } from './liveContext';
import { CardBody, Empty } from './parts';

// ── Headline leaves ──────────────────────────────────────────────────────────

/** Change over the last five minutes of samples, as StatBlock wants it. */
function deltaOf(history: Sample[], key: keyof Omit<Sample, 'label'>) {
  if (history.length < 2) return undefined;
  const latest = history[history.length - 1][key];
  const before = history[Math.max(0, history.length - 31)][key];
  if (!before) return undefined;
  return { pct: ((latest - before) / before) * 100, label: 'vs 5 min ago' };
}

function Stat({
  status,
  metric,
  value,
  caption,
  tone,
}: {
  status: StreamStatus;
  metric: keyof Omit<Sample, 'label'>;
  value: number;
  caption: string;
  tone: Tone;
}) {
  const { ui } = useFlowContext();
  const { history } = useLive();
  const StatBlock = ui?.StatBlock;
  if (!StatBlock) return null;
  if (isBlocked(status)) {
    return (
      <StatBlock value='—' caption='Not available to you' tone='neutral' />
    );
  }
  return (
    <StatBlock
      value={value}
      caption={caption}
      tone={tone}
      spark={history.slice(-18).map((s) => s[metric])}
      delta={deltaOf(history, metric)}
    />
  );
}

export function WaitingStat() {
  const { queues, queueStatus } = useLive();
  const waiting = queues.reduce((n, q) => n + q.waiting, 0);
  const longest = queues.reduce((n, q) => Math.max(n, q.longestWaitSec), 0);
  return (
    <Stat
      status={queueStatus}
      metric='waiting'
      value={waiting}
      caption={waiting ? `longest ${fmtSeconds(longest)}` : 'no one waiting'}
      tone={waiting > 0 ? 'warning' : 'success'}
    />
  );
}

export function AgentsFreeStat() {
  const { queues, queueStatus } = useLive();
  const free = queues.reduce((n, q) => n + q.agentsAvailable, 0);
  const loggedIn = queues.reduce((n, q) => n + q.agentsLoggedIn, 0);
  return (
    <Stat
      status={queueStatus}
      metric='agentsFree'
      value={free}
      caption={`of ${loggedIn} logged in`}
      tone={free > 0 ? 'success' : 'warning'}
    />
  );
}

export function CallsStat() {
  const { calls, callStatus } = useLive();
  const connected = calls.filter((c) => c.state === 'active').length;
  return (
    <Stat
      status={callStatus}
      metric='calls'
      value={calls.length}
      caption={`${connected} connected`}
      tone='primary'
    />
  );
}

export function PhonesStat() {
  const { devices, deviceStatus } = useLive();
  const registered = devices.filter((d) => d.registered).length;
  return (
    <Stat
      status={deviceStatus}
      metric='registered'
      value={registered}
      caption={`of ${devices.length} seen`}
      tone={registered === devices.length ? 'success' : 'warning'}
    />
  );
}

export function AvailableStat() {
  const { presence, presenceStatus } = useLive();
  const open = presence.filter((p) => p.presence === 'open').length;
  return (
    <Stat
      status={presenceStatus}
      metric='available'
      value={open}
      caption={`of ${presence.length} seen`}
      tone='info'
    />
  );
}

// ── Trend ────────────────────────────────────────────────────────────────────

export function ActivityChart() {
  const { ui } = useFlowContext();
  const { history } = useLive();
  const Chart = ui?.Chart;
  if (!Chart) return null;
  if (history.length < 2) {
    return (
      <Empty
        icon='mdi:chart-areaspline'
        title='Collecting'
        description='The trend fills in every ten seconds while this page is open.'
      />
    );
  }
  return (
    <Chart
      kind='area'
      height={220}
      data={history.map((sample) => ({ ...sample }))}
      xKey='label'
      series={[
        { key: 'calls', label: 'Calls in progress', tone: 'primary' },
        { key: 'waiting', label: 'Callers waiting', tone: 'warning' },
        { key: 'agentsFree', label: 'Agents free', tone: 'success' },
      ]}
    />
  );
}

// ── Queues and agents ────────────────────────────────────────────────────────

export function QueuesCard() {
  const { ui } = useFlowContext();
  const { queues, queueStatus } = useLive();
  const pick = useContext(QueuePickContext);
  const { Table, TableHead, TableBody, TableRow, TableCell, Chip } = ui ?? {};
  if (!Table || !TableHead || !TableBody || !TableRow || !TableCell || !Chip)
    return null;
  return (
    <CardBody status={queueStatus} call='queues.onDomainQueues({ stats })'>
      {queues.length === 0 ? (
        <Empty icon='mdi:account-group' title='No queue activity yet' />
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Queue</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell align='right'>Longest</TableCell>
              <TableCell align='right'>Agents free</TableCell>
              <TableCell align='right'>On calls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {queues.map((q) => (
              <TableRow
                key={q.queue}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => pick(q.queue)}
              >
                <TableCell>{q.queue}</TableCell>
                <TableCell>
                  <Chip
                    size='small'
                    label={q.waiting}
                    color={chipColor(
                      q.waiting === 0
                        ? 'success'
                        : q.agentsAvailable === 0
                          ? 'error'
                          : 'warning',
                    )}
                  />
                </TableCell>
                <TableCell align='right'>
                  {fmtSeconds(q.longestWaitSec)}
                </TableCell>
                <TableCell align='right'>
                  {q.agentsAvailable} / {q.agentsLoggedIn}
                </TableCell>
                <TableCell align='right'>{q.activeCalls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  );
}

function agentTone(status: string, activeCalls: number): Tone {
  if (activeCalls > 0) return 'primary';
  return status === 'available' ? 'success' : 'neutral';
}

export function AgentsCard() {
  const { ui } = useFlowContext();
  const { agents, agentStatus, nameOf } = useLive();
  const {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Avatar,
    Stack,
    Typography,
  } = ui ?? {};
  if (
    !Table ||
    !TableHead ||
    !TableBody ||
    !TableRow ||
    !TableCell ||
    !Chip ||
    !Avatar ||
    !Stack ||
    !Typography
  ) {
    return null;
  }
  return (
    <CardBody
      status={agentStatus}
      call='queues.onDomainQueues({ agentUpdated, agentAdded, agentRemoved })'
    >
      {agents.length === 0 ? (
        <Empty icon='mdi:headset' title='No agent changes yet' />
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell>Queue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Calls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((a) => (
              <TableRow key={agentKey(a)}>
                <TableCell>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                      {initials(nameOf(a.user))}
                    </Avatar>
                    <Typography variant='body2'>{nameOf(a.user)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{a.queue}</TableCell>
                <TableCell>
                  <Chip
                    size='small'
                    variant='outlined'
                    label={a.activeCalls > 0 ? 'On a call' : a.status}
                    color={chipColor(agentTone(a.status, a.activeCalls))}
                  />
                </TableCell>
                <TableCell align='right'>{a.activeCalls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  );
}

// ── Calls ────────────────────────────────────────────────────────────────────

function party(p: CallActivity['from']): string {
  return p.name || p.user || p.number || 'Unknown';
}

function callTone(c: CallActivity): Tone {
  return c.state === 'active'
    ? 'success'
    : c.state === 'held'
      ? 'warning'
      : 'info';
}

export function CallsCard() {
  const { ui } = useFlowContext();
  const { calls, callStatus, now } = useLive();
  const { Table, TableHead, TableBody, TableRow, TableCell, Chip } = ui ?? {};
  if (!Table || !TableHead || !TableBody || !TableRow || !TableCell || !Chip)
    return null;
  return (
    <CardBody
      status={callStatus}
      call='calls.onDomainCalls({ updated, ended })'
    >
      {calls.length === 0 ? (
        <Empty icon='mdi:phone-in-talk' title='No calls in progress' />
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Via</TableCell>
              <TableCell>State</TableCell>
              <TableCell align='right'>Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((c) => (
              <TableRow key={c.callId}>
                <TableCell>{party(c.from)}</TableCell>
                <TableCell>{party(c.to)}</TableCell>
                <TableCell>
                  {c.through ? c.through.name || c.through.user : '—'}
                </TableCell>
                <TableCell>
                  <Chip
                    size='small'
                    label={c.state}
                    color={chipColor(callTone(c))}
                  />
                </TableCell>
                <TableCell align='right'>
                  {fmtSeconds(since(c.answeredAt ?? c.startedAt, now))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  );
}

// ── Phones ───────────────────────────────────────────────────────────────────

export function PhonesCard() {
  const { ui } = useFlowContext();
  const { devices, deviceStatus, nameOf } = useLive();
  const {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Typography,
  } = ui ?? {};
  if (
    !Table ||
    !TableHead ||
    !TableBody ||
    !TableRow ||
    !TableCell ||
    !Chip ||
    !Tooltip ||
    !Typography
  ) {
    return null;
  }
  return (
    <CardBody status={deviceStatus} call='devices.onDomain(update)'>
      {devices.length === 0 ? (
        <Empty
          icon='mdi:phone-classic'
          title='No registration changes yet'
          description='A phone appears here when it registers or drops off.'
        />
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Device</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Transport</TableCell>
              <TableCell align='right'>Latency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((d) => (
              <TableRow key={d.device}>
                <TableCell>
                  <Tooltip title={d.userAgent || 'Unknown phone'}>
                    <Typography variant='body2'>{d.device}</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{nameOf(d.user)}</TableCell>
                <TableCell>
                  <Chip
                    size='small'
                    variant='outlined'
                    label={d.registered ? 'Registered' : 'Not registered'}
                    color={d.registered ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{d.transport || '—'}</TableCell>
                <TableCell align='right'>
                  {d.latencyMs ? `${Math.round(d.latencyMs.current)} ms` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardBody>
  );
}

// ── Feeds ────────────────────────────────────────────────────────────────────

function severityTone(n: FlowNotification): Tone {
  return n.severity === 'success' ||
    n.severity === 'warning' ||
    n.severity === 'error'
    ? n.severity
    : 'info';
}

function timeOf(iso: string): string {
  const t = Date.parse(iso);
  return Number.isNaN(t)
    ? ''
    : new Date(t).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function NotificationsCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { notifications, notificationStatus } = useLive();
  const ActivityList = ui?.ActivityList;
  if (!ActivityList) return null;
  const rows: ActivityRow[] = notifications.map((n) => ({
    id: n.id,
    primary: n.title ?? n.category,
    secondary: n.body ?? undefined,
    meta: timeOf(n.createdAt),
    tone: severityTone(n),
  }));
  return (
    <CardBody
      status={notificationStatus}
      call='notifications.onNotification(update)'
    >
      {rows.length === 0 ? (
        <Empty icon='mdi:bell-outline' title='No notifications yet' />
      ) : (
        <ActivityList rows={rows} width={widget.pixel.width} />
      )}
    </CardBody>
  );
}

export function UserChangesCard({ widget }: DashboardTemplateWidgetProps) {
  const { ui } = useFlowContext();
  const { userChanges, userStatus } = useLive();
  const ActivityList = ui?.ActivityList;
  if (!ActivityList) return null;
  const rows: ActivityRow[] = userChanges.map((u, i) => ({
    id: `${u.user}-${i}`,
    primary: u.name || u.user,
    secondary: u.doNotDisturb
      ? 'Do not disturb'
      : (u.statusMessage ??
        (u.messageWaiting ? 'Voicemail waiting' : u.presence)),
    meta: timeOf(u.updatedAt),
    tone: u.doNotDisturb ? 'warning' : u.messageWaiting ? 'info' : 'neutral',
  }));
  return (
    <CardBody status={userStatus} call='subscribers.onDomain(update)'>
      {rows.length === 0 ? (
        <Empty
          icon='mdi:account-edit'
          title='No user record changes yet'
          description='Do-not-disturb, status messages and voicemail flags show up here.'
        />
      ) : (
        <ActivityList rows={rows} width={widget.pixel.width} />
      )}
    </CardBody>
  );
}

// ── Presence ─────────────────────────────────────────────────────────────────

function presenceTone(state: string): Tone {
  return state === 'open'
    ? 'success'
    : state === 'inactive'
      ? 'neutral'
      : 'warning';
}

export function PresenceSummaryCard() {
  const { ui } = useFlowContext();
  const { presence, presenceStatus } = useLive();
  const Donut = ui?.Donut;
  if (!Donut) return null;
  const counts = presence.reduce<Record<string, number>>((acc, p) => {
    const key = p.presence || 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <CardBody status={presenceStatus} call='presence.onDomain(update)'>
      {presence.length === 0 ? (
        <Empty
          icon='mdi:account-circle-outline'
          title='No presence changes yet'
          description='Change your status in the top bar to see one.'
        />
      ) : (
        <Donut
          height={200}
          centerLabel={`${presence.length} seen`}
          slices={Object.entries(counts).map(([label, value]) => ({
            label,
            value,
            tone: presenceTone(label),
          }))}
        />
      )}
    </CardBody>
  );
}

export function PresenceListCard() {
  const { ui } = useFlowContext();
  const { presence, presenceStatus } = useLive();
  const { List, ListItem, ListItemText, Avatar, Chip } = ui ?? {};
  if (!List || !ListItem || !ListItemText || !Avatar || !Chip) return null;
  return (
    <CardBody status={presenceStatus} call='presence.onDomain(update)'>
      {presence.length === 0 ? (
        <Empty
          icon='mdi:account-multiple'
          title='Nobody has changed status yet'
        />
      ) : (
        <List dense disablePadding>
          {presence.map((p) => {
            const name = `${p.firstName} ${p.lastName}`.trim() || p.user;
            return (
              <ListItem
                key={p.user}
                disableGutters
                secondaryAction={
                  <Chip
                    size='small'
                    variant='outlined'
                    label={p.presence}
                    color={chipColor(presenceTone(p.presence))}
                  />
                }
              >
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, mr: 1.5 }}>
                  {initials(name)}
                </Avatar>
                <ListItemText
                  primary={name}
                  secondary={p.statusMessage ?? `Extension ${p.user}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </CardBody>
  );
}
