/**
 * Sync outcomes — the demo's `ui.Donut` example.
 *
 * Lives only on the Example CRM page (`pages/VendorDashboardPage.tsx`), not in
 * the host's widget catalogue, and that is worth noticing on its own: a card
 * built with `templates.DashboardTemplate` is page content, so it needs no
 * registration, no zone and no id anybody has to keep stable. An app can add one
 * without touching what it contributes to the platform.
 *
 * The donut is its own kit component rather than a mode of `ui.Chart` because it
 * takes no axes and the host lays its legend out differently — the same split
 * the native usage-breakdown panels make. Slice colour comes from a semantic
 * `tone`, so the ring follows the light/dark toggle with nothing here to update.
 *
 * It reads the same `mocks/syncQueue.ts` fixture the sync queue table pages
 * through, so the two cards on this page always agree about how many rows are
 * failing.
 */
import { useMemo } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import type { SyncState } from '../mocks/syncQueue';
import { buildSyncQueue } from '../mocks/syncQueue';

/** State → the semantic tone the host resolves. Never a colour literal. */
const SLICE_TONE: Record<SyncState, 'success' | 'info' | 'neutral' | 'error'> =
  {
    Synced: 'success',
    Syncing: 'info',
    Queued: 'neutral',
    Failed: 'error',
  };

const ORDER: SyncState[] = ['Synced', 'Syncing', 'Queued', 'Failed'];

/**
 * Takes no props. The template hands every card a `widget` box, and this one has
 * nothing to do with it: a ring sizes to its container and reads no timestamps,
 * so accepting the argument only to ignore it would suggest otherwise.
 */
export function SyncOutcomesDonut() {
  const { ui } = useFlowContext();
  const { Donut, Stack, Typography } = ui ?? {};

  // Tick 0: this is a snapshot of the queue's shape, not a live drain — the
  // table next to it owns the cadence.
  const slices = useMemo(() => {
    const rows = buildSyncQueue(0);
    return ORDER.map((state) => ({
      label: state,
      value: rows.filter((row) => row.state === state).length,
      tone: SLICE_TONE[state],
    })).filter((slice) => slice.value > 0);
  }, []);

  const total = slices.reduce((n, s) => n + s.value, 0);

  // Carve-out: with no kit there is nothing to draw a ring with.
  if (!Donut) {
    if (!Stack || !Typography) return null;
    return (
      <Stack direction='column' sx={{ height: '100%' }}>
        <Typography variant='body2' color='text.secondary'>
          {total} contacts in the queue
        </Typography>
      </Stack>
    );
  }

  return <Donut slices={slices} centerLabel={`${total}`} />;
}
