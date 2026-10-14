/**
 * Contacts synced — a `kind: 'leaf'` widget with `leafOf: 'demo-insight'`.
 *
 * Registered in `App.tsx` §4. The body is `ui.StatBlock` — the same block the
 * native stat leaves draw — so this cell and *Active Calls* two panels over are
 * the same component with different numbers. It used to hand-build a value, a
 * caption and a row of `Box` bars, which is how an app's leaf ended up sitting
 * beside a native one looking like a different kind of thing.
 *
 * The leaf contract is unchanged and still worth knowing: no `size` (its
 * container's grid owns the width) and `widget.pixel` is `{ width: 0, height: 0 }`,
 * so nothing here reads a box. The only difference from `RecordedCallsStat` is
 * where it lands — that one declares `leafOf: 'stat'` and drops into the host's
 * own stat card; this one names the category the demo's container accepts.
 */
import type { WidgetComponentProps } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { CONTACTS_SYNCED_24H, SYNC_TREND_24H } from '../mocks/syncQueue';

// Trend against the previous bucket, derived once — the fixture is static, so
// recomputing per render could not produce a different answer.
const PREVIOUS = SYNC_TREND_24H[SYNC_TREND_24H.length - 2];
const LATEST = SYNC_TREND_24H[SYNC_TREND_24H.length - 1];
const DELTA_PCT = ((LATEST - PREVIOUS) / PREVIOUS) * 100;

export function SyncedContactsStat({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { StatBlock } = context.ui ?? {};

  // Carve-out: with no kit there is nothing to render but the number.
  if (!StatBlock) {
    return <div {...marker}>{CONTACTS_SYNCED_24H}</div>;
  }

  return (
    // No heading — the container's leaf frame drew "Contacts synced" from the
    // registration's `title`.
    <StatBlock
      {...marker}
      value={CONTACTS_SYNCED_24H.toLocaleString()}
      caption='contacts reconciled'
      delta={{ pct: DELTA_PCT }}
      spark={SYNC_TREND_24H}
      tone='primary'
    />
  );
}
