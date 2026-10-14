/** Showcase section: Stack & Divider layout primitives. */
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function LayoutSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Box, Avatar, Chip, Typography, Stack, Paper, Divider } = ui || {};
  if (!Paper || !Typography || !Stack || !Box) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Stack & Divider
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Layout components for spacing and separation. Stack is vertical (column)
        by default — pass direction="row" for horizontal.
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Horizontal Stack (direction="row")
          </Typography>
          <Paper rounded variant='outlined' sx={{ p: 2 }}>
            <Stack direction='row' spacing={2} alignItems='center'>
              {Avatar && <Avatar>JD</Avatar>}
              <Typography>John Doe</Typography>
              {Chip && (
                <Chip
                  label={t?.('ROLE_ADMIN') ?? 'Admin'}
                  size='small'
                  color='primary'
                />
              )}
            </Stack>
          </Paper>
        </Box>

        {Divider && <Divider />}

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Vertical Stack (default — no direction needed)
          </Typography>
          <Paper rounded variant='outlined' sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant='body2'>Item 1</Typography>
              <Typography variant='body2'>Item 2</Typography>
              <Typography variant='body2'>Item 3</Typography>
            </Stack>
          </Paper>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Divider Examples
          </Typography>
          <Paper rounded variant='outlined' sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant='body2'>Content above divider</Typography>
              {Divider && <Divider />}
              <Typography variant='body2'>Content below divider</Typography>
            </Stack>
          </Paper>
        </Box>
      </Stack>

      <SectionCode>
        {`const { Stack, Divider, Avatar, Chip, Typography } = flowContext.ui;

// Horizontal Stack
<Stack direction="row" spacing={2} alignItems="center">
  <Avatar>JD</Avatar>
  <Typography>John Doe</Typography>
  <Chip label="Admin" size="small" color="primary" />
</Stack>

// Vertical Stack
<Stack spacing={1.5}>
  <Typography variant="body2">Item 1</Typography>
  <Typography variant="body2">Item 2</Typography>
  <Typography variant="body2">Item 3</Typography>
</Stack>

// Divider Example
<Stack spacing={2}>
  <Typography variant="body2">Content above divider</Typography>
  <Divider />
  <Typography variant="body2">Content below divider</Typography>
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User cards, form layouts, list items, card sections (e.g.,
        user profile displays, settings panels)
      </Typography>
    </Paper>
  );
}
