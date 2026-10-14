/** Showcase section: Tooltip. */
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function TooltipSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Tooltip, IconButton, Button, Chip, Typography, Stack, Paper, Box } =
    ui || {};
  if (!Paper || !Typography || !Stack || !Tooltip || !IconButton || !Box)
    return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Tooltip
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        The name of a control that shows only an icon, and the room to say what
        a truncated or abbreviated value actually is. Hover or tab to any of
        these.
      </Typography>

      <Stack spacing={2.5}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Naming an icon-only control
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Tooltip title={t?.('EDIT') ?? 'Edit'} arrow>
              <IconButton
                icon='mdi:pencil'
                aria-label={t?.('EDIT') ?? 'Edit'}
              />
            </Tooltip>
            <Tooltip title={t?.('DELETE') ?? 'Delete'} arrow>
              <IconButton
                icon='mdi:delete'
                color='error'
                aria-label={t?.('DELETE') ?? 'Delete'}
              />
            </Tooltip>
            <Tooltip title='Re-run the sync now' arrow>
              <IconButton icon='mdi:sync' aria-label='Re-run the sync now' />
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Placement
          </Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
              <Tooltip
                key={placement}
                title={`placement="${placement}"`}
                placement={placement}
                arrow
              >
                {Button ? (
                  <Button variant='outlined' size='small'>
                    {placement}
                  </Button>
                ) : (
                  <IconButton icon='mdi:help' aria-label={placement} />
                )}
              </Tooltip>
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Explaining an abbreviated value
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Tooltip title='Last synced 2026-09-02 08:41:17 UTC' arrow>
              <Typography
                variant='body2'
                sx={{
                  borderBottom: '1px dotted',
                  borderColor: 'divider',
                  cursor: 'help',
                }}
              >
                4 hours ago
              </Typography>
            </Tooltip>
            {Chip ? (
              <Tooltip title='6 of 168 contacts failed to reconcile' arrow>
                <Chip label='6 failed' color='error' />
              </Tooltip>
            ) : null}
          </Stack>
        </Box>
      </Stack>

      <SectionCode>
        {`const { Tooltip, IconButton } = flowContext.ui;

// The tooltip is for the POINTER. Keep the aria-label too — a screen reader
// never sees the tooltip, and an icon button without one is unnamed.
<Tooltip title="Edit" arrow>
  <IconButton icon="mdi:pencil" aria-label="Edit" />
</Tooltip>

// placement: top | right | bottom | left (plus -start / -end variants)
<Tooltip title="Re-run the sync" placement="right" arrow>
  <Button variant="outlined">Sync</Button>
</Tooltip>

// Wrapping your own element? It must forward a ref and accept the handlers
// the tooltip attaches — every kit component does.`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: icon buttons, help text, truncated content — action button
        labels, field descriptions. A tooltip is never the only place something
        important is said: it does not exist on touch, and it cannot be selected
        or copied.
      </Typography>
    </Paper>
  );
}
