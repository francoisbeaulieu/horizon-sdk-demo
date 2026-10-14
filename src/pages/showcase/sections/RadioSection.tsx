/** Showcase section: Radio (single). */
import { useState } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function RadioSection() {
  const { ui } = useFlowContext();
  const { Radio, Typography, Stack, Paper } = ui || {};
  const [radioValue, setRadioValue] = useState('option1');
  if (!Paper || !Typography || !Stack || !Radio) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Radio
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Single selection
      </Typography>

      <Stack spacing={1}>
        <Radio
          label='Option 1'
          checked={radioValue === 'option1'}
          onChange={() => setRadioValue('option1')}
        />
        <Radio
          label='Option 2'
          checked={radioValue === 'option2'}
          onChange={() => setRadioValue('option2')}
        />
      </Stack>

      <SectionCode>
        {`const { Radio } = flowContext.ui;
const [radioValue, setRadioValue] = useState('option1');

<Stack spacing={1}>
  <Radio
    label="Option 1"
    checked={radioValue === 'option1'}
    onChange={() => setRadioValue('option1')}
  />
  <Radio
    label="Option 2"
    checked={radioValue === 'option2'}
    onChange={() => setRadioValue('option2')}
  />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Forms with exclusive choices, settings (e.g., payment method
        selection, notification preferences)
      </Typography>
    </Paper>
  );
}
