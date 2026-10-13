/** Showcase section: the static Table primitives. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const ROWS = [
  { zone: 'page-header-actions', mounts: 'Page header', count: 5 },
  { zone: 'table-row-actions', mounts: 'Each table row', count: 1 },
  { zone: 'inbound-call-content', mounts: 'Ringing call card', count: 1 },
];

export default function TableSection() {
  const { ui } = useFlowContext();
  const {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Paper,
  } = ui || {};
  if (
    !Paper ||
    !Typography ||
    !Table ||
    !TableHead ||
    !TableBody ||
    !TableRow ||
    !TableCell
  ) {
    return null;
  }

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Table
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        For a short, fixed table of reference rows. Anything sortable,
        filterable or paginated wants <code>templates.DatagridTemplate</code>{' '}
        instead.
      </Typography>

      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Zone</TableCell>
            <TableCell>Mounts</TableCell>
            <TableCell align='right'>Extensions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROWS.map((r) => (
            <TableRow key={r.zone}>
              <TableCell>
                <code>{r.zone}</code>
              </TableCell>
              <TableCell>{r.mounts}</TableCell>
              <TableCell align='right'>{r.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SectionCode>
        {`const { Table, TableHead, TableBody, TableRow, TableCell } =
  flowContext.ui;

<Table size="small">
  <TableHead>
    <TableRow><TableCell>Zone</TableCell></TableRow>
  </TableHead>
  <TableBody>
    {rows.map((r) => (
      <TableRow key={r.zone}><TableCell>{r.zone}</TableCell></TableRow>
    ))}
  </TableBody>
</Table>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 There is no <code>TableContainer</code> — wrap in{' '}
        <code>
          Paper sx=&#123;&#123; overflowX: &apos;auto&apos; &#125;&#125;
        </code>
        , which is all it did. No <code>TableSortLabel</code> either: sorting is
        the datagrid&rsquo;s job, and a hand-sorted header is how the two
        quietly diverge.
      </Typography>
    </Paper>
  );
}
