/** DemoPage tab: Walkthrough — jump to each surface in the host. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { WALKTHROUGH } from '../../content/demoContent';

export default function WalkthroughPanel() {
  const { ui, navigate } = useFlowContext();
  const { Paper, Stack, Box, Typography, Button } = ui || {};
  if (!Paper || !Stack || !Box || !Typography || !Button) return null;

  return (
    <Paper rounded>
      <Typography variant='h6'>See it in action</Typography>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 0.5, mb: 2 }}
      >
        This app registers{' '}
        <strong>3 pages, 10 zone extensions, and 1 table column</strong>, plus a
        live call-event subscription and an on-demand side panel. Jump to each
        surface:
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
        }}
      >
        {WALKTHROUGH.map((item) => (
          <Paper rounded key={item.label} background={1}>
            <Stack spacing={1.5} alignItems='flex-start'>
              <Box>
                <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                  {item.label}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.desc}
                </Typography>
              </Box>
              <Button
                variant='contained'
                size='small'
                onClick={() => navigate(item.nav)}
              >
                Go to {item.label} →
              </Button>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Paper rounded background={1} sx={{ mt: 3 }}>
        <Typography variant='subtitle2' fontWeight={600} gutterBottom>
          Everywhere
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          The Help button sits in the global top bar on every page and opens the
          shared side panel; an enriched caller card appears in the inbound-call
          widget whenever a call rings in.
        </Typography>
      </Paper>
    </Paper>
  );
}
