/** Showcase section: StatBlock and Donut — the dashboard's own figures. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const SPARK = [96, 141, 118, 187, 152, 204, 173, 213];

const BLOCKS = [
  {
    value: '1,284',
    caption: 'contacts reconciled',
    delta: { pct: 23.12 },
    tone: 'primary' as const,
  },
  {
    value: 42,
    caption: 'awaiting retry',
    delta: { pct: -8.4 },
    tone: 'warning' as const,
  },
  { value: '99.9%', caption: 'delivery rate', tone: 'success' as const },
];

const SLICES = [
  { label: 'Synced', value: 128, tone: 'success' as const },
  { label: 'Queued', value: 34, tone: 'neutral' as const },
  { label: 'Failed', value: 6, tone: 'error' as const },
];

export default function StatBlockSection() {
  const { ui } = useFlowContext();
  const { StatBlock, Donut, Typography, Stack, Paper, Box } = ui || {};
  if (!Paper || !Typography || !Stack || !StatBlock || !Box) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        StatBlock &amp; Donut
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        The figure block the native dashboard draws, and the usage ring beside
        it — the same components, so a contributed card sits among them.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          // The block lays its sparkline out as `flex: 1`, so it needs a row
          // height to grow into. On a dashboard the card frame supplies one;
          // here the grid does, or the spark would collapse to nothing.
          gridAutoRows: 'minmax(132px, auto)',
          gap: 2,
          mb: 3,
        }}
      >
        {BLOCKS.map((b) => (
          <StatBlock key={b.caption} {...b} spark={SPARK} />
        ))}
      </Box>

      {Donut ? (
        <Box sx={{ maxWidth: 460 }}>
          <Donut slices={SLICES} centerLabel='168' height={200} />
        </Box>
      ) : null}

      <SectionCode>
        {`const { StatBlock, Donut } = flowContext.ui;

<StatBlock
  value="1,284"
  caption="contacts reconciled"
  delta={{ pct: 23.12 }}      // the trend pill; sign picks the colour
  spark={[96, 141, 118, 187]} // the sparkline under it
  tone="primary"
/>

<Donut
  slices={[
    { label: 'Synced', value: 128, tone: 'success' },
    { label: 'Failed', value: 6,   tone: 'error' },
  ]}
  centerLabel="168"
/>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Use <strong>StatBlock</strong> for a <code>leaf</code> widget and it
        lands inside the host&rsquo;s stats card looking like the native blocks
        beside it — same 700-weight value, same trend pill, same sparkline.
      </Typography>
    </Paper>
  );
}
