/**
 * Showcase section: Chip.
 *
 * Deliberately does NOT demonstrate `size='small'`. The platform's theme sets
 * `MuiChip.defaultProps.size = 'small'`, so passing it changes nothing and a
 * row containing a chip labelled "Small" that is the same height as the four
 * beside it teaches the reader something false. The variations below are the
 * ones that actually move.
 */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const COLORS = [
  'neutral',
  'primary',
  'success',
  'warning',
  'error',
  'info',
] as const;

const ROWS: Array<{ title: string; note: string; variant?: string }> = [
  {
    title: 'Soft (the default)',
    note: 'A tinted pill. What the platform uses for status almost everywhere.',
  },
  {
    title: 'Filled',
    variant: 'filled',
    note: 'Solid. Loud enough that one per view is usually the limit.',
  },
  {
    title: 'Outlined',
    variant: 'outlined',
    note: 'Quietest of the three — reads as metadata rather than status.',
  },
];

export default function ChipSection() {
  const { ui } = useFlowContext();
  const { Chip, Icon, Typography, Stack, Paper, Box } = ui || {};
  if (!Paper || !Typography || !Stack || !Chip || !Box) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Chip
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Status, tags and labels — three weights across the platform&rsquo;s six
        semantic colours.
      </Typography>

      <Stack spacing={2.5}>
        {ROWS.map((row) => (
          <Box key={row.title}>
            <Typography variant='subtitle2'>{row.title}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {row.note}
            </Typography>
            <Stack
              direction='row'
              spacing={1}
              flexWrap='wrap'
              useFlexGap
              sx={{ mt: 1 }}
            >
              {COLORS.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  color={color}
                  {...(row.variant ? { variant: row.variant } : {})}
                />
              ))}
            </Stack>
          </Box>
        ))}

        <Box>
          <Typography variant='subtitle2'>Interactive</Typography>
          <Typography variant='caption' color='text.secondary'>
            A chip that does something says so — <code>onClick</code> gives it a
            hover and focus state, <code>onDelete</code> adds the dismiss
            affordance.
          </Typography>
          <Stack
            direction='row'
            spacing={1}
            flexWrap='wrap'
            useFlexGap
            sx={{ mt: 1 }}
          >
            <Chip
              label='With icon'
              color='success'
              {...(Icon
                ? { icon: <Icon icon='mdi:check-circle-outline' /> }
                : {})}
            />
            <Chip label='Clickable' color='primary' onClick={() => {}} />
            <Chip label='Deletable' color='warning' onDelete={() => {}} />
            <Chip label='Both' onClick={() => {}} onDelete={() => {}} />
          </Stack>
        </Box>
      </Stack>

      <SectionCode>
        {`const { Chip } = flowContext.ui;

// Colour is semantic, and the same six everywhere:
//   neutral · primary · success · warning · error · info
<Chip label="Active" color="success" />

// Three weights. 'soft' is the default and is what native status uses.
<Chip label="Active" color="success" variant="filled" />
<Chip label="Active" color="success" variant="outlined" />

<Chip label="Sync now" color="primary" onClick={run} />
<Chip label="crm-tag"  onDelete={() => remove(tag)} />

// Note there is no size to pick: the theme sets size="small" platform-wide,
// so passing it is a no-op and passing "medium" makes your chip the odd one
// out in a row of native ones.`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: status indicators, tags, labels — user roles, device status,
        call states. Pick the colour for what it <em>means</em>, never for how
        it looks: a reseller&rsquo;s palette can move every one of these, and
        only the semantic choice survives that.
      </Typography>
    </Paper>
  );
}
