/** DemoPage tab: Extension Zones — every zone this demo registers into. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { ZONES } from '../../content/demoContent';
import { accentAt } from './accents';

export default function ZonesPanel() {
  const { ui } = useFlowContext();
  const { Paper, Stack, Typography } = ui || {};
  if (!Paper || !Stack || !Typography) return null;

  return (
    <Paper>
      <Typography variant='h6'>Extension zones used by this demo</Typography>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 0.5, mb: 3 }}
      >
        Generic zones the host mounts on its pages. A single registration
        targets a zone plus one or more route patterns — see the Code tab. The
        last two are dashboard-widget zones: they name a dashboard rather than a
        slot on a page, take no route patterns, and offer the widget in that
        dashboard’s Customize catalogue for the user to add.
      </Typography>

      <Stack spacing={2}>
        {ZONES.map((z, i) => (
          <Paper
            key={z.zone}
            variant='outlined'
            sx={{
              p: 3,
              bgcolor: 'background.elevation1',
              borderLeft: '4px solid',
              borderLeftColor: accentAt(i),
            }}
          >
            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              {z.zone}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {z.desc}
            </Typography>
            <Typography variant='body2' fontStyle='italic' sx={{ mt: 0.5 }}>
              In this demo: {z.usedFor}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
