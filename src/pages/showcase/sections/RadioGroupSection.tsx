/** Showcase section: RadioGroup (pre-built). */
import { useState } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function RadioGroupSection() {
  const { ui } = useFlowContext();
  const { RadioGroup, Typography, Stack, Paper } = ui || {};
  const [radioGroupValue, setRadioGroupValue] = useState('all');
  if (!Paper || !Typography || !Stack || !RadioGroup) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        RadioGroup
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Pre-built radio button group
      </Typography>

      <RadioGroup
        label='Preference'
        value={radioGroupValue}
        onChange={(e) => setRadioGroupValue(e.target.value)}
        options={[
          { value: 'all', label: 'All notifications' },
          { value: 'important', label: 'Important only' },
          { value: 'none', label: 'None' },
        ]}
      />

      <SectionCode>
        {`const { RadioGroup } = flowContext.ui;
const [radioGroupValue, setRadioGroupValue] = useState('all');

<RadioGroup
  label="Preference"
  value={radioGroupValue}
  onChange={(e) => setRadioGroupValue(e.target.value)}
  options={[
    { value: 'all', label: 'All notifications' },
    { value: 'important', label: 'Important only' },
    { value: 'none', label: 'None' }
  ]}
/>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Settings panels, configuration forms (e.g., notification
        preferences, call routing options)
      </Typography>
    </Paper>
  );
}
