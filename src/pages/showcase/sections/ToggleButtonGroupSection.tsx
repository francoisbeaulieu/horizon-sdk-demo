/** Showcase section: ToggleButtonGroup (exclusive + multi-select). */
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function ToggleButtonGroupSection() {
  const { ui } = useFlowContext();
  const { ToggleButtonGroup, Box, Typography, Stack, Paper } = ui || {};
  const [toggleValue, setToggleValue] = useState('left');
  const [toggleMultiple, setToggleMultiple] = useState(['bold']);
  if (!Paper || !Typography || !Stack || !ToggleButtonGroup || !Box)
    return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        ToggleButtonGroup
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Toggle button groups
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Exclusive (single selection)
          </Typography>
          <ToggleButtonGroup
            value={toggleValue}
            exclusive
            onChange={(_e: SyntheticEvent, v: string | null) =>
              v && setToggleValue(v)
            }
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
          />
        </Box>
        <Box>
          <Typography variant='subtitle2' gutterBottom>
            Multi-select (non-exclusive)
          </Typography>
          <ToggleButtonGroup
            value={toggleMultiple}
            onChange={(_e: SyntheticEvent, v: string[]) => setToggleMultiple(v)}
            options={[
              { value: 'bold', label: 'Bold' },
              { value: 'italic', label: 'Italic' },
              { value: 'underline', label: 'Underline' },
            ]}
          />
        </Box>
      </Stack>

      <SectionCode>
        {`const { ToggleButtonGroup } = flowContext.ui;
const [toggleValue, setToggleValue] = useState('left');

<ToggleButtonGroup
  value={toggleValue}
  exclusive
  onChange={(e, v) => v && setToggleValue(v)}
  options={[
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ]}
/>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: View switchers, filters (e.g., call log view toggle, date
        range selector, status filter)
      </Typography>
    </Paper>
  );
}
