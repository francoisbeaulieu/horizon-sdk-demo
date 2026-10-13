/**
 * Showcase section: Button.
 *
 * The rows here are horizontal on purpose. This section used to stack every
 * button in a 200px-wide column, which stretched each one to that width and
 * made a set of four peers read as a menu — buttons sit side by side in every
 * real toolbar, dialog and form footer in the platform, and a showcase that
 * shows them any other way is showing the wrong thing.
 */
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const COLORS = ['primary', 'secondary', 'success', 'error'] as const;

export default function ButtonsSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Box, Button, Icon, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !Button || !Box) return null;

  const row = (title: string, note: string, children: React.ReactNode) => (
    <Box key={title}>
      <Typography variant='subtitle2'>{title}</Typography>
      <Typography variant='caption' color='text.secondary'>
        {note}
      </Typography>
      <Stack
        direction='row'
        spacing={1}
        flexWrap='wrap'
        useFlexGap
        alignItems='center'
        sx={{ mt: 1 }}
      >
        {children}
      </Stack>
    </Box>
  );

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Buttons
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Three weights, four semantic colours, three sizes. One primary action
        per view; everything else steps down.
      </Typography>

      <Stack spacing={2.5}>
        {row(
          'Contained',
          'The primary action. At most one per view — two contained buttons side by side is a decision the user cannot make.',
          COLORS.map((color) => (
            <Button key={color} variant='contained' color={color}>
              {color}
            </Button>
          )),
        )}

        {row(
          'Outlined',
          'The secondary action beside a contained one — Cancel next to Save.',
          COLORS.map((color) => (
            <Button key={color} variant='outlined' color={color}>
              {color}
            </Button>
          )),
        )}

        {row(
          'Text',
          'The tertiary action, and the right weight inside a dense row or a table cell.',
          COLORS.map((color) => (
            <Button key={color} variant='text' color={color}>
              {color}
            </Button>
          )),
        )}

        {row(
          'Sizes',
          'Default is medium. Small belongs in toolbars and cards; large is for a lone call to action.',
          (['small', 'medium', 'large'] as const).map((size) => (
            <Button key={size} variant='contained' size={size}>
              {size}
            </Button>
          )),
        )}

        {row(
          'With icons and states',
          'startIcon leads, endIcon trails. A disabled button still has to say what it would do.',
          <>
            {Icon ? (
              <Button variant='contained' startIcon={<Icon icon='mdi:sync' />}>
                Sync now
              </Button>
            ) : null}
            {Icon ? (
              <Button
                variant='outlined'
                endIcon={<Icon icon='mdi:open-in-new' />}
              >
                Open in CRM
              </Button>
            ) : null}
            <Button variant='contained' disabled>
              {t?.('DISABLED') ?? 'Disabled'}
            </Button>
            <Button variant='outlined' disabled>
              {t?.('DISABLED') ?? 'Disabled'}
            </Button>
          </>,
        )}
      </Stack>

      <SectionCode>
        {`const { Button } = flowContext.ui;

// variant: contained → outlined → text, in descending emphasis
// color:   primary · secondary · success · error
// size:    small · medium (default) · large
<Button variant="contained" color="primary">Save</Button>
<Button variant="outlined">Cancel</Button>
<Button variant="text" size="small">Details</Button>

// Icons are elements, so they come from the kit too — never an <svg> of
// your own, which would miss the theme's sizing and colour.
<Button variant="contained" startIcon={<Icon icon="mdi:sync" />}>
  Sync now
</Button>

<Button disabled>Disabled</Button>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: form actions, toolbars, dialogs — Save/Cancel in user
        settings, Add User in user management. For a header action, prefer the
        <code> actions</code> prop on <code>PageTemplate</code> over a Button of
        your own: the host places and styles it like every other page&rsquo;s.
      </Typography>
    </Paper>
  );
}
