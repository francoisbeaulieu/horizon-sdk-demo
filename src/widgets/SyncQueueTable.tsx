/**
 * CRM sync queue — a `kind: 'panel'` widget in the **tables** category.
 *
 * Registered in `App.tsx` §4. Built on `templates.DatagridTemplate`, which is
 * the same grid the native *Suspect Domains* panel uses — so sorting, search,
 * density, column show/hide and the pagination footer all come from the host and
 * this file supplies columns and rows. It previously composed `ui.Table` by
 * hand, which is the right primitive for a short fixed reference table and the
 * wrong one for anything a reader will want to sort.
 *
 * It is also the demo's `refreshPolicy: 'own-cadence'` example: the widget owns
 * a timer, so the host hands it no `widget.range` at all. `actions.refresh()`
 * is wired to the toolbar, and because refresh is implemented host-side as a
 * remount, the poll counter below visibly restarts at zero — which is the
 * clearest way to show what Refresh actually does.
 */
import type { WidgetComponentProps } from '@netsapiens/flow-sdk';
import { useEffect, useMemo, useState } from 'react';

import type { SyncQueueRow, SyncState } from '../mocks/syncQueue';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { buildSyncQueue } from '../mocks/syncQueue';

/** How often this widget polls. Its own business — the host is not consulted. */
const POLL_MS = 5_000;

/** Chip colour per state. Palette keys, so all four follow the theme toggle. */
const STATE_COLOR: Record<SyncState, string> = {
  Synced: 'success',
  Syncing: 'info',
  Queued: 'default',
  Failed: 'error',
};

export function SyncQueueTable({
  context,
  actions,
  ...marker
}: WidgetComponentProps & ZoneMarkerProps) {
  const { Stack, Typography, Chip } = context.ui ?? {};
  const DatagridTemplate = context.ui?.templates?.DatagridTemplate;

  // The cadence this widget declared. A remount from `actions.refresh()` resets
  // it to zero, which is the visible proof of what Refresh actually does.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((current) => current + 1), POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const rows = useMemo(() => buildSyncQueue(tick), [tick]);
  const failed = rows.filter((row) => row.state === 'Failed').length;

  const columns = useMemo(
    () => [
      { field: 'contact', headerName: 'Contact', flex: 1, minWidth: 140 },
      { field: 'company', headerName: 'Team', flex: 1, minWidth: 140 },
      { field: 'direction', headerName: 'Direction', width: 110 },
      {
        field: 'state',
        headerName: 'State',
        width: 130,
        // The one renderer here, and only because a status genuinely reads
        // better as a chip. Everything else is plain data the grid formats.
        renderCell: (params: { row: SyncQueueRow }) =>
          Chip ? (
            <Chip
              size='small'
              variant='outlined'
              color={STATE_COLOR[params.row.state]}
              label={
                params.row.state === 'Failed'
                  ? `Failed x${params.row.attempts}`
                  : params.row.state
              }
            />
          ) : (
            params.row.state
          ),
      },
    ],
    [Chip],
  );

  // Carve-out: with no kit there is nothing to render but the count.
  if (!DatagridTemplate || !Stack || !Typography) {
    return <div {...marker}>{rows.length} contacts queued</div>;
  }

  return (
    // No card and no heading — the frame drew both, plus the subtitle, before
    // this rendered.
    <Stack {...marker} direction='column' spacing={1} sx={{ height: '100%' }}>
      <DatagridTemplate<SyncQueueRow>
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        // Ten rows is the whole fixture, so the grid fills the card it is given
        // rather than leaving a band of empty space above the pagination footer.
        // A card's height is not the widget's to choose — see the note in the
        // host's DashboardGrid — so filling what you are handed is the move.
        defaultPageSize={10}
        pageSizeOptions={[10, 25]}
        toolbar={{
          enableSearch: true,
          searchPlaceholder: 'Search contacts',
          enableColumns: true,
          // The grid's own Refresh button, wired to the widget action rather
          // than to a local refetch: the host remounts this component, which is
          // the only refresh it can honestly offer against an app's own data.
          enableRefresh: true,
          onRefresh: () => actions.refresh(),
        }}
      />

      {/* Demo licence: a real widget would not print its poll count. A partner
          reading this wants to see the declared cadence tick, and see Refresh
          restart it. */}
      <Typography variant='caption' color='text.secondary'>
        Polled {tick}x &middot; every {POLL_MS / 1000}s &middot; {failed}{' '}
        failing &middot; {rows.length} contacts
      </Typography>
    </Stack>
  );
}
