/** Showcase section: IconButton. */
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function IconButtonSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { IconButton, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !IconButton) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        IconButton
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Icon-only buttons
      </Typography>

      <Stack direction='row' spacing={1}>
        <IconButton icon='mdi:pencil' aria-label={t?.('EDIT') ?? 'Edit'} />
        <IconButton
          icon='mdi:delete'
          color='error'
          aria-label={t?.('DELETE') ?? 'Delete'}
        />
        <IconButton
          icon='mdi:settings'
          size='small'
          aria-label={t?.('SETTINGS') ?? 'Settings'}
        />
      </Stack>

      <SectionCode>
        {`const { IconButton } = flowContext.ui;

<Stack direction="row" spacing={1}>
  <IconButton icon="mdi:pencil" aria-label="Edit" />
  <IconButton icon="mdi:delete" color="error" aria-label="Delete" />
  <IconButton icon="mdi:settings" size="small" aria-label="Settings" />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Toolbars, data grids, side trays (e.g., edit/delete actions
        in user list, settings menu toggle)
      </Typography>
    </Paper>
  );
}
