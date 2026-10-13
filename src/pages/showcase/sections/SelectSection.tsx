/** Showcase section: Select dropdown. */
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function SelectSection() {
  const { ui } = useFlowContext();
  const { Select, Typography, Stack, Paper } = ui || {};
  const [selectValue, setSelectValue] = useState('option1');
  if (!Paper || !Typography || !Stack || !Select) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        Select
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Dropdown selection
      </Typography>

      <Select
        label='Choose Option'
        value={selectValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSelectValue(e.target.value)
        }
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ]}
      />

      <SectionCode>
        {`const { Select } = flowContext.ui;
const [selectValue, setSelectValue] = useState('option1');

<Select
  label="Choose Option"
  value={selectValue}
  onChange={(e) => setSelectValue(e.target.value as string)}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
/>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Forms, filters, settings (e.g., account status selector,
        timezone picker, device type filter)
      </Typography>
    </Paper>
  );
}
