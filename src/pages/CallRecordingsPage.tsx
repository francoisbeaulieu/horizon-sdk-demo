/**
 * Call Recordings — a full page registered into the host's My Account (/home)
 * menu, and the reference for building a list page that looks native.
 *
 * It exists because `DatagridTemplate` gives you the whole list-page apparatus
 * and the common failure is rebuilding parts of it by hand. Every control below
 * comes from the template or from PageTemplate; nothing is re-implemented:
 *
 *   - Primary action ("Share selected") lives in PageTemplate's `actions`, so it
 *     renders top-right in the header like "+ Add Domain" on native pages — NOT
 *     in the table toolbar.
 *   - Search is `toolbar.enableSearch`, so it is the host's rounded field with a
 *     magnifier. A hand-rolled TextField is the single most obvious tell that a
 *     page was not built with the template.
 *   - Rows-per-page, the row count and the page arrows are the grid's own footer.
 *     There is nothing to add above the table.
 *   - Export / Filter / Columns are toolbar flags.
 *   - `toolbar.customControls` holds only the thing the host cannot know about —
 *     here a "Starred only" switch. That is what the slot is for.
 *
 * It also exercises the props that a remote app could not reach before the SDK's
 * datagrid type was widened: `pageSizeOptions`, `enableCheckboxSelection` +
 * `onSelectionChange`, `initialState`, master-detail via
 * `getDetailPanelContent`, and a bounded `height`.
 */
import type { DatagridAction, DatagridColumn } from '@netsapiens/flow-sdk';
import { useCallback, useMemo, useState } from 'react';
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import type { CallRecording } from '../mocks/callRecordings';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import {
  formatRecordingDuration,
  formatRecordingStartedAt,
  SAMPLE_CALL_RECORDINGS,
} from '../mocks/callRecordings';

const STATUS_COLOR: Record<CallRecording['status'], string> = {
  Processed: 'success',
  Processing: 'warning',
  Failed: 'error',
};

// Constant props hoisted to module scope so they never churn identity. The grid
// caches its column set against the identity of `columns`/`actions`, and reads
// every object-valued prop the same way, so an inline literal here would make it
// reprocess on every re-render of this page — and this page re-renders on each
// selection change. See "Keep columns and actions stable" in DATAGRID.md.
const getRowId = (row: CallRecording) => row.id;
const getDetailPanelHeight = () => 'auto' as const;
const INITIAL_STATE = {
  // Newest first, and keep Notes out of the way until asked for.
  sorting: [{ field: 'startedAt', sort: 'desc' as const }],
  columnVisibility: { notes: false },
};
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function CallRecordingsPage({ ...marker }: ZoneMarkerProps) {
  const flowContext = useFlowContext();
  const { t } = useLocale();

  const [starredOnly, setStarredOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<CallRecording[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const ui = flowContext.ui;
  const { PageTemplate, DatagridTemplate } = ui?.templates || {};
  const { Alert, Box, Chip, FormControlLabel, Switch, Typography } = ui || {};

  // `customControls` is a node, so memoize it — an inline element would be a new
  // reference every render and re-mount the switch on each keystroke in search.
  const starredSwitch = useMemo(() => {
    if (!FormControlLabel || !Switch) return undefined;
    return (
      <FormControlLabel
        control={
          <Switch
            size='small'
            checked={starredOnly}
            onChange={(_event: unknown, checked: boolean) =>
              setStarredOnly(checked)
            }
          />
        }
        label='Starred only'
      />
    );
  }, [FormControlLabel, Switch, starredOnly]);

  const rows = useMemo(
    () =>
      starredOnly
        ? SAMPLE_CALL_RECORDINGS.filter((row) => row.starred)
        : SAMPLE_CALL_RECORDINGS,
    [starredOnly],
  );

  // `useCallback` so the memos below actually hold — a memo whose dependency is a
  // fresh function every render buys nothing. `setX` setters are already stable,
  // which is why these have empty dependency arrays.
  const handleRefresh = useCallback(() => {
    // Stands in for a refetch; `refreshing` drives the toolbar button's spinner.
    setRefreshing(true);
    setLastAction('Refreshed the recording list.');
    window.setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleSelectionChange = useCallback(
    (selectedRows: CallRecording[]) => setSelected(selectedRows),
    [],
  );

  // Depends only on `Chip` (stable, from context) — so the grid's column set is
  // built once, not on every selection change.
  const columns = useMemo<DatagridColumn<CallRecording>[]>(
    () => [
      { field: 'title', headerName: 'Recording', flex: 1, minWidth: 200 },
      { field: 'party', headerName: 'Party', width: 150 },
      {
        field: 'direction',
        headerName: 'Direction',
        type: 'singleSelect',
        valueOptions: ['Inbound', 'Outbound'],
        width: 120,
      },
      {
        field: 'startedAt',
        headerName: 'Started',
        type: 'dateTime',
        width: 180,
        // A `dateTime` column must receive a Date, not the raw ISO string — that
        // is what gives the filter panel date operators and sorts chronologically
        // rather than alphabetically. MUI X passes these args positionally.
        valueGetter: (_value: unknown, row: CallRecording) =>
          new Date(row.startedAt),
        // `renderCell` rather than `valueFormatter`: a column with no renderCell
        // is rendered from the raw value, not the formatted one, so a formatter
        // alone would show the full JS date string on screen.
        renderCell: ({ row }: { row: CallRecording }) =>
          formatRecordingStartedAt(row.startedAt),
        exportValue: ({ row }: { row: CallRecording }) => row.startedAt,
      },
      {
        field: 'durationSec',
        headerName: 'Duration',
        type: 'number',
        width: 110,
        // Same reason — display goes through renderCell. The valueFormatter is
        // kept because CSV export *does* honour it.
        renderCell: ({ row }: { row: CallRecording }) =>
          formatRecordingDuration(row.durationSec),
        valueFormatter: (value: unknown) =>
          formatRecordingDuration(value as number),
      },
      { field: 'sizeMb', headerName: 'Size (MB)', type: 'number', width: 110 },
      {
        field: 'status',
        headerName: 'Status',
        type: 'singleSelect',
        valueOptions: ['Processed', 'Processing', 'Failed'],
        width: 130,
        renderCell: ({ row }: { row: CallRecording }) =>
          Chip ? (
            <Chip
              size='small'
              label={row.status}
              color={STATUS_COLOR[row.status]}
            />
          ) : (
            row.status
          ),
        // The Chip is markup, so give CSV export a plain-text equivalent.
        exportValue: ({ row }: { row: CallRecording }) => row.status,
      },
      { field: 'starred', headerName: 'Starred', type: 'boolean', width: 110 },
      // Hidden by default via INITIAL_STATE; users can re-enable it from the
      // Columns picker and the choice persists per user.
      { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 200 },
    ],
    [Chip],
  );

  const actions = useMemo<DatagridAction<CallRecording>[]>(
    () => [
      {
        label: 'Play',
        icon: 'mdi:play-circle-outline',
        // Failed recordings have no audio, so hide rather than disable.
        visible: (row: CallRecording) => row.status !== 'Failed',
        disabled: (row: CallRecording) => row.status === 'Processing',
        getTooltip: (row: CallRecording) =>
          row.status === 'Processing'
            ? 'Still processing — audio is not ready yet'
            : 'Play recording',
        onClick: (row: CallRecording) =>
          setLastAction(`Playing "${row.title}".`),
      },
      {
        label: 'Download',
        icon: 'mdi:download',
        disabled: (row: CallRecording) => row.status !== 'Processed',
        getTooltip: (row: CallRecording) =>
          row.status === 'Processed'
            ? 'Download audio'
            : `Not available while ${row.status.toLowerCase()}`,
        onClick: (row: CallRecording) =>
          setLastAction(`Downloading "${row.title}".`),
      },
      {
        label: 'Delete',
        icon: 'mdi:delete',
        color: 'error',
        onClick: (row: CallRecording) =>
          setLastAction(`Deleted "${row.title}".`),
      },
    ],
    [],
  );

  const toolbar = useMemo(
    () => ({
      enableSearch: true,
      searchPlaceholder: 'Search recordings, party or notes…',
      enableFilter: true,
      enableColumns: true,
      enableExport: true,
      exportFilename: 'call-recordings',
      enableRefresh: true,
      onRefresh: handleRefresh,
      refreshing,
      customControls: starredSwitch,
    }),
    [handleRefresh, refreshing, starredSwitch],
  );

  // Expanding a row shows the transcript — content the columns can't hold.
  const getDetailPanelContent = useCallback(
    ({ row }: { row: CallRecording }) =>
      Box && Typography ? (
        <Box sx={{ p: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            Transcript excerpt
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {row.transcriptExcerpt}
          </Typography>
          {row.notes ? (
            <Typography variant='body2' sx={{ mt: 1 }}>
              <strong>Notes:</strong> {row.notes}
            </Typography>
          ) : null}
        </Box>
      ) : null,
    [Box, Typography],
  );

  if (!PageTemplate || !DatagridTemplate || !Box || !Typography) {
    return (
      <div {...marker} style={{ padding: 24 }}>
        UI components not available
      </div>
    );
  }

  return (
    // `layout="fill"` is the whole story for grid sizing: the info Alert above the
    // grid, the toolbar, and anything the host injects all take their height
    // first, and the grid absorbs the remainder — so its pagination row sits on
    // the bottom edge of the viewport. This page used to hand-tune
    // `height={'calc(100vh - 470px)'}` to achieve the same thing, which was only
    // correct until the banner above it changed.
    <PageTemplate
      layout='fill'
      {...marker}
      title={t?.('CALL_RECORDINGS') ?? 'Call recordings'}
      subtitle='Recordings of calls on your extension'
      breadcrumbs={[
        { label: t?.('MY_ACCOUNT') ?? 'My Account', url: '/home/dashboard' },
        { label: t?.('CALL_RECORDINGS') ?? 'Call recordings' },
      ]}
      // Descriptors, not JSX — the host renders these as themed buttons in the
      // header. `disabled` reacts to the grid's checkbox selection.
      //
      // Inline on purpose: PageTemplate does not cache against prop identity the
      // way the grid does, and this array has to change whenever the selection
      // does. The identity contract applies to the DatagridTemplate props below.
      actions={[
        {
          label: selected.length
            ? `Share ${selected.length} selected`
            : 'Share selected',
          icon: 'mdi:share-variant',
          variant: 'primary',
          disabled: selected.length === 0,
          tooltip:
            selected.length === 0
              ? 'Select one or more recordings first'
              : undefined,
          onClick: () =>
            setLastAction(
              `Shared ${selected.length} recording${selected.length === 1 ? '' : 's'}: ${selected
                .map((row) => row.title)
                .join(', ')}`,
            ),
        },
      ]}
    >
      {/* No wrapper around these two on purpose. `layout="fill"` makes the page
          body a flex column with its own gap, and the grid fills what is left of
          it. A <Stack> here would sit in between as an ordinary content-sized flex
          item, and the grid would size to the Stack instead of to the page — which
          is what used to be hidden by the hand-tuned `height`. */}
      {Alert && (
        <Alert severity={lastAction ? 'success' : 'info'}>
          {lastAction ??
            'Every control on this page — search, filter, columns, export, refresh, selection and the pagination footer — comes from DatagridTemplate. Only the "Starred only" switch is app-specific.'}
        </Alert>
      )}

      <DatagridTemplate
        data={rows}
        getRowId={getRowId}
        columns={columns}
        actions={actions}
        toolbar={toolbar}
        enableCheckboxSelection
        onSelectionChange={handleSelectionChange}
        initialState={INITIAL_STATE}
        getDetailPanelContent={getDetailPanelContent}
        getDetailPanelHeight={getDetailPanelHeight}
        defaultPageSize={25}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />
    </PageTemplate>
  );
}
