/** Showcase section: DatagridTemplate (sortable/filterable data table). */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { DATAGRID_SAMPLE_USERS } from '../../../mocks/datagridSample';
import { SectionCode } from '../SectionCode';

// Hoisted to module scope on purpose. The grid caches its internal column set
// against the identity of `columns`/`actions`/`toolbar`, so a fresh literal per
// render makes it reprocess every column — the cost that turns a table sharing a
// component with a form into 150-300ms per keystroke. These close over nothing,
// so they never need to be rebuilt. See DATAGRID.md § "Keep columns and actions
// stable".
const COLUMNS = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'status', headerName: 'Status', width: 100 },
];

const ACTIONS = [
  {
    label: 'Edit',
    icon: 'mdi:pencil',
    onClick: (row: unknown) => console.log('Edit:', row),
  },
  {
    label: 'Delete',
    icon: 'mdi:delete',
    onClick: (row: unknown) => console.log('Delete:', row),
    color: 'error' as const,
  },
];

const TOOLBAR = {
  enableSearch: true,
  searchPlaceholder: 'Search users...',
  enableExport: true,
  enableFilter: true,
  enableColumns: true,
  enableRefresh: true,
  onRefresh: () => console.log('Refresh'),
};

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const getRowId = (row: { id: string | number }) => row.id;

export default function DataGridSection() {
  const { ui } = useFlowContext();
  const { Box, Typography, Paper } = ui || {};
  const { DatagridTemplate } = ui?.templates || {};
  if (!Paper || !Typography || !Box || !DatagridTemplate) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        DatagridTemplate
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Pre-built data table with sorting, filtering, and actions
      </Typography>

      <Box>
        <DatagridTemplate
          data={DATAGRID_SAMPLE_USERS}
          columns={COLUMNS}
          actions={ACTIONS}
          toolbar={TOOLBAR}
          getRowId={getRowId}
          defaultPageSize={5}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          height='420px'
        />
      </Box>

      <SectionCode>
        {`const { DatagridTemplate } = flowContext.ui.templates;

// Define these OUTSIDE the render. The grid caches its column set against the
// identity of columns/actions/toolbar, so a fresh array literal per render makes
// it reprocess every column. On a page that also holds a form, that turns into
// 150-300ms per keystroke. See DATAGRID.md § "Keep columns and actions stable".
const COLUMNS = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'status', headerName: 'Status', width: 100 },
];
const getRowId = (row) => row.id;

function UsersPage() {
  // Anything closing over state or handlers goes in useMemo/useCallback instead.
  const actions = useMemo(
    () => [
      { label: 'Edit', icon: 'mdi:pencil', onClick: edit },
      { label: 'Delete', icon: 'mdi:delete', onClick: remove, color: 'error' },
    ],
    [edit, remove],
  );
  const toolbar = useMemo(
    () => ({
      enableSearch: true, enableExport: true, enableFilter: true,
      enableColumns: true, enableRefresh: true, onRefresh: refetch,
    }),
    [refetch],
  );

  return (
    <DatagridTemplate
      data={users}
      columns={COLUMNS}
      actions={actions}
      toolbar={toolbar}
      getRowId={getRowId}
      loading={isLoading}
      defaultPageSize={5}
      pageSizeOptions={[5, 10, 25]}
      height="420px"
    />
  );
}`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User lists, device tables, call logs, any tabular data
        (e.g., User Management, Device Management, Reports)
      </Typography>

      <Typography
        variant='caption'
        color='info.main'
        sx={{ mt: 2, display: 'block' }}
      >
        📄 <strong>Pagination:</strong> the footer (row count, rows-per-page,
        page arrows) is always rendered — it is client-side over the rows you
        pass in. The usual reason it looks absent is{' '}
        <code>height=&quot;auto&quot;</code>: that sizes the grid to its rows,
        so the footer follows the last row — roughly{' '}
        <code>rows × rowHeight</code> down the page, about 1600px at{' '}
        <code>defaultPageSize=25</code> with 64px rows, so it is two screens
        below the fold. Use <code>&quot;auto&quot;</code> only with a small{' '}
        <code>defaultPageSize</code>. Otherwise leave <code>height</code> unset
        and put <code>layout=&quot;fill&quot;</code> on the surrounding{' '}
        <code>PageTemplate</code>: the grid then absorbs whatever height is left
        in the page and its footer sits on the viewport&apos;s bottom edge, with
        no offset for you to calculate or keep in step. Passing fewer rows than{' '}
        <code>defaultPageSize</code> also leaves every control correctly
        disabled.
      </Typography>

      <Typography
        variant='caption'
        color='info.main'
        sx={{ mt: 2, display: 'block' }}
      >
        🔌 <strong>Dynamic Columns:</strong> Other federated apps can add
        columns to your table by registering dynamic columns for a specific
        zone. Add <code>dynamicColumnsZone="your-zone-id"</code> to enable this
        (e.g., "users-columns", "call-logs-columns"). Registered columns
        right-align by default to match native columns.
      </Typography>
    </Paper>
  );
}
