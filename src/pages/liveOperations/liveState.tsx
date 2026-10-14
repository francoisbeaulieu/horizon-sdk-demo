import type {
  AgentStatus,
  CallActivity,
  CallRecord,
  DeviceUpdate,
  FlowNotification,
  PresenceChange,
  QueueStats,
  RemoteAppSDK,
  SubscriberUpdate,
} from '@netsapiens/flow-sdk';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useStream } from '@netsapiens/flow-sdk';

import type { LiveState, RecordDelivery, Sample } from './liveContext';
import {
  agentKey,
  HISTORY_POINTS,
  LiveContext,
  SAMPLE_MS,
} from './liveContext';

/**
 * The Live Operations streams, opened ONCE for the whole page.
 *
 * Every card on every tab reads from this provider. The host's DashboardTemplate
 * mounts and remounts card bodies as it lays out the grid and as tabs switch;
 * subscribing inside a card would open and close a feed each time. Opening them
 * here also keeps the trend history running while another tab is showing.
 *
 * Eight feeds, each with `useStream` (subscribes on mount, closes on unmount,
 * returns the status):
 *
 *   queues.onDomainQueues({ stats })                         → queues
 *   queues.onDomainQueues({ agentUpdated, agentAdded, … })   → agents
 *   calls.onDomainCalls({ updated, ended })                  → calls
 *   presence.onDomain(update)                                → presence
 *   devices.onDomain(update)                                 → phones
 *   notifications.onNotification(update)                     → notifications
 *   subscribers.onDomain(update)                             → user record changes
 *   cdrs.onDomain({ completed, updated })                    → call records
 *
 * The queue drill-down opens an eighth, `queues.onQueue`, only while its panel
 * is open — see QueuePanel.tsx.
 */

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

/** Keep this many records and deliveries; the page is a live view, not a log. */
const RECORDS_KEPT = 50;

/**
 * The fields filled in after a call. A record arrives on `completed` with them
 * empty and again on `updated` as each one lands.
 */
const LATE_FIELDS: [string, (r: CallRecord) => unknown][] = [
  ['disposition', (r) => r.disposition],
  ['reason', (r) => r.reason],
  ['notes', (r) => r.notes],
  ['recording', (r) => r.recordingStatus],
  ['MOS (orig)', (r) => r.mos.orig],
  ['MOS (term)', (r) => r.mos.term],
  ['summary', (r) => r.summary],
];

function changedFields(
  before: CallRecord | undefined,
  after: CallRecord,
): string[] {
  if (!before) return [];
  return LATE_FIELDS.filter(([, read]) => read(before) !== read(after)).map(
    ([name]) => name,
  );
}

/** Totals the headline numbers and the trend history are made of. */
function totals(
  queues: QueueStats[],
  calls: CallActivity[],
  devices: DeviceUpdate[],
  presence: PresenceChange[],
) {
  return {
    calls: calls.length,
    waiting: queues.reduce((n, q) => n + q.waiting, 0),
    agentsFree: queues.reduce((n, q) => n + q.agentsAvailable, 0),
    registered: devices.filter((d) => d.registered).length,
    available: presence.filter((p) => p.presence === 'open').length,
  };
}

export function LiveProvider({
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
  const presenceStatus = useStream(
    sdk,
    (streams) =>
      streams.presence.onDomain((p) =>
        setPresence((m) => upsert(m, p.user, p)),
      ),
    [],
  );

  // Admins see the domain's phones; Basic and Advanced Users only their own.
  const [devices, setDevices] = useState(new Map<string, DeviceUpdate>());
  const deviceStatus = useStream(
    sdk,
    (streams) =>
      streams.devices.onDomain((d) =>
        setDevices((m) => upsert(m, d.device, d)),
      ),
    [],
  );

  // The signed-in user's own notifications and the domain's.
  const [notifications, setNotifications] = useState<FlowNotification[]>([]);
  const notificationStatus = useStream(
    sdk,
    (streams) =>
      streams.notifications.onNotification((n) =>
        setNotifications((list) =>
          [n, ...list.filter((x) => x.id !== n.id)].slice(0, 30),
        ),
      ),
    [],
  );

  // Domain admins only: every user record change in the domain.
  const [userChanges, setUserChanges] = useState<SubscriberUpdate[]>([]);
  const userStatus = useStream(
    sdk,
    (streams) =>
      streams.subscribers.onDomain((u) =>
        setUserChanges((list) => [u, ...list].slice(0, 30)),
      ),
    [],
  );

  // Domain admins only; everyone else is refused with the host's message. The previous version of each record is
  // kept in a ref so a delivery can say what changed.
  const lastRecord = useRef(new Map<string, CallRecord>());
  const [records, setRecords] = useState(new Map<string, CallRecord>());
  const [recordDeliveries, setRecordDeliveries] = useState<RecordDelivery[]>(
    [],
  );
  const recordStatus = useStream(
    sdk,
    (streams) => {
      const receive = (kind: RecordDelivery['kind'], record: CallRecord) => {
        const changed = changedFields(
          lastRecord.current.get(record.recordId),
          record,
        );
        lastRecord.current.set(record.recordId, record);
        if (lastRecord.current.size > RECORDS_KEPT * 4) {
          lastRecord.current.delete(lastRecord.current.keys().next().value!);
        }
        setRecords((m) => upsert(m, record.recordId, record));
        setRecordDeliveries((list) =>
          [
            {
              id: `${record.recordId}-${Date.now()}-${list.length}`,
              kind,
              record,
              changed,
              receivedAt: Date.now(),
            },
            ...list,
          ].slice(0, RECORDS_KEPT),
        );
      };
      return streams.cdrs.onDomain({
        completed: (r) => receive('completed', r),
        updated: (r) => receive('updated', r),
      });
    },
    [],
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const queueList = [...queues.values()].sort((a, b) =>
    a.queue.localeCompare(b.queue),
  );
  const callList = [...calls.values()].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );
  const deviceList = [...devices.values()].sort((a, b) =>
    a.device.localeCompare(b.device),
  );
  const presenceList = [...presence.values()];

  // Sample the totals for the trend history. Read through a ref so the timer
  // is set up once rather than on every frame.
  const latest = useRef(totals(queueList, callList, deviceList, presenceList));
  latest.current = totals(queueList, callList, deviceList, presenceList);
  const [history, setHistory] = useState<Sample[]>([]);
  useEffect(() => {
    const take = () =>
      setHistory((h) =>
        [
          ...h,
          {
            label: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            ...latest.current,
          },
        ].slice(-HISTORY_POINTS),
      );
    take();
    const id = setInterval(take, SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  const nameOf = (user: string) => {
    const p = presence.get(user);
    const name = p ? `${p.firstName} ${p.lastName}`.trim() : '';
    return name || user;
  };

  const state: LiveState = {
    sdk,
    queues: queueList,
    queueStatus,
    agents: [...agents.values()].sort(
      (a, b) => a.queue.localeCompare(b.queue) || a.user.localeCompare(b.user),
    ),
    agentStatus,
    calls: callList,
    callStatus,
    presence: presenceList,
    presenceStatus,
    devices: deviceList,
    deviceStatus,
    notifications,
    notificationStatus,
    userChanges,
    userStatus,
    records: [...records.values()]
      .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
      .slice(0, RECORDS_KEPT),
    recordDeliveries,
    recordStatus,
    history,
    now,
    nameOf,
  };
  return <LiveContext.Provider value={state}>{children}</LiveContext.Provider>;
}
