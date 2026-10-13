/**
 * The Live Operations data contract: what LiveProvider (liveState.tsx) holds and
 * how cards read it. Kept apart from the components so fast refresh works.
 */
import type {
  AgentStatus,
  CallActivity,
  DeviceUpdate,
  FlowNotification,
  PresenceChange,
  QueueStats,
  RemoteAppSDK,
  StreamStatus,
  SubscriberUpdate,
} from '@netsapiens/flow-sdk';
import { createContext, useContext } from 'react';

/** One point of the trend history, taken every SAMPLE_MS. */
export interface Sample {
  label: string;
  calls: number;
  waiting: number;
  agentsFree: number;
  registered: number;
  available: number;
}

export interface LiveState {
  sdk: RemoteAppSDK;
  queues: QueueStats[];
  queueStatus: StreamStatus;
  agents: AgentStatus[];
  agentStatus: StreamStatus;
  calls: CallActivity[];
  callStatus: StreamStatus;
  presence: PresenceChange[];
  presenceStatus: StreamStatus;
  devices: DeviceUpdate[];
  deviceStatus: StreamStatus;
  notifications: FlowNotification[];
  notificationStatus: StreamStatus;
  /** Most recent first. */
  userChanges: SubscriberUpdate[];
  userStatus: StreamStatus;
  /** Oldest first, at most HISTORY_POINTS. */
  history: Sample[];
  /** A one-second clock, so durations count between frames. */
  now: number;
  /** Display name for a user, from whatever the page has seen of them. */
  nameOf: (user: string) => string;
}

/** Trend sampling: every 10 s, 15 minutes kept. */
export const SAMPLE_MS = 10_000;
export const HISTORY_POINTS = 90;

export const LiveContext = createContext<LiveState | null>(null);

export function useLive(): LiveState {
  const state = useContext(LiveContext);
  if (!state)
    throw new Error('Live Operations card rendered outside LiveProvider');
  return state;
}

export const agentKey = (a: AgentStatus) => `${a.queue}|${a.agent}`;

/** Which queue's drill-down panel is open; set by a Queues row click. */
export const QueuePickContext = createContext<(queue: string) => void>(
  () => {},
);
