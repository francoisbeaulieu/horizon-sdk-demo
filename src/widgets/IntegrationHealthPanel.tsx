/**
 * Integration health — a **container panel**: `kind: 'panel'` plus
 * `acceptsLeaves: { category: 'demo-insight' }`.
 *
 * Registered in `App.tsx` §4. This is the third widget shape, and the one that
 * is easiest to miss: an app can ship a container of its own and the leaves that
 * go in it, not only top-level panels and leaves that borrow the host's stat
 * card. The host's `LeafContainer` takes over the body — it lays the leaves out,
 * runs the second sortable scope so they reorder within this card and cannot
 * escape it, and draws the empty state with a route back to the catalogue when
 * the last one is removed.
 *
 * Two things follow from that, and both are contract, not accident:
 *
 * - **This component is not rendered.** The grid branches on `acceptsLeaves`
 *   before it ever reaches `component`, exactly as it does for the host's own
 *   STATISTICS panel. The field is required, so something has to be passed; the
 *   host passes `() => null`. This returns a line of explanation instead, so a
 *   host that has not implemented leaf containers degrades to a legible card
 *   rather than an empty one.
 * - **The category is the app's own.** `'demo-insight'`, not `'stat'`. The host
 *   resolves a leaf's container by finding the first registered panel accepting
 *   its category, so declaring `'stat'` here would collide with the host's stat
 *   card and the two would race for every stat leaf on the dashboard. Namespace
 *   a container category the way you namespace anything else shared.
 *
 * Its leaves are `SyncedContactsStat.tsx` and `SyncFailuresStat.tsx`.
 */
import type { WidgetComponentProps } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

export function IntegrationHealthPanel({
  context,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography } = context.ui ?? {};

  if (!Stack || !Typography) {
    return <div {...marker}>Integration health</div>;
  }

  return (
    <Stack
      {...marker}
      direction='column'
      spacing={1}
      justifyContent='center'
      sx={{ height: '100%' }}
    >
      <Typography variant='body2' color='text.secondary'>
        This card holds the demo app&rsquo;s own stat blocks. Add them from
        Customize — the host lays them out and reorders them inside this panel.
      </Typography>
    </Stack>
  );
}
