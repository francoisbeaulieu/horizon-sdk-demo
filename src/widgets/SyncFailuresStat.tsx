/**
 * Sync failures — the second `leafOf: 'demo-insight'` leaf.
 *
 * Registered in `App.tsx` §4. A container with one leaf shows that leaves land
 * in it; a container with two shows the rest of the contract — they reorder
 * within that card and nowhere else, and removing one leaves the container on
 * the grid rather than deleting it.
 *
 * Drawn with `ui.StatBlock` like its neighbour, and reading the same
 * `mocks/syncQueue.ts` fixture the sync queue pages through, so the failing rows
 * in that panel and the count here always agree. Two surfaces disagreeing about
 * one number is the thing a dashboard is least forgiven for.
 */
import type { WidgetComponentProps } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CONTACTS_SYNCED_24H, SYNC_FAILURES_24H } from '../mocks/syncQueue';

const FAILURE_RATE = (
  (SYNC_FAILURES_24H / (CONTACTS_SYNCED_24H + SYNC_FAILURES_24H)) *
  100
).toFixed(2);

/** Retry attempts across the window — the shape the failures arrived in. */
const FAILURE_TREND = [0, 1, 0, 2, 1, 0, 1, 2];

/**
 * Trend against the previous bucket, so this block carries the same delta pill
 * every native stat block does. Guarded because the previous bucket can be zero
 * and a failure count legitimately starts there — dividing by it would put
 * `Infinity%` on the card.
 */
const PREVIOUS = FAILURE_TREND[FAILURE_TREND.length - 2];
const LATEST = FAILURE_TREND[FAILURE_TREND.length - 1];
const DELTA_PCT = PREVIOUS ? ((LATEST - PREVIOUS) / PREVIOUS) * 100 : undefined;

export function SyncFailuresStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { StatBlock } = context.ui ?? {};

  if (!StatBlock) return <div {...marker}>{SYNC_FAILURES_24H}</div>;

  return (
    <StatBlock
      {...marker}
      value={SYNC_FAILURES_24H}
      caption={`${FAILURE_RATE}% of attempts`}
      delta={DELTA_PCT === undefined ? undefined : { pct: DELTA_PCT }}
      spark={FAILURE_TREND}
      // Semantic, not decorative: the host resolves the colour, so this stays
      // right in both colour modes.
      tone={SYNC_FAILURES_24H > 0 ? 'error' : 'success'}
    />
  );
}
