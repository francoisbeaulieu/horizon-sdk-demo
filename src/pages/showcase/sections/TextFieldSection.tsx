/** Showcase section: TextField. */
import { useState } from 'react';
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function TextFieldSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { TextField, Typography, Stack, Paper } = ui || {};
  const [inputValue, setInputValue] = useState('');
  if (!Paper || !Typography || !Stack || !TextField) return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        TextField
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Text input fields
      </Typography>

      <Stack spacing={2}>
        <TextField
          label='Basic Input'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
        />
        <TextField label='Required' required fullWidth />
        <TextField label={t?.('DISABLED') ?? 'Disabled'} disabled fullWidth />
      </Stack>

      <SectionCode>
        {`const { TextField } = flowContext.ui;
const [inputValue, setInputValue] = useState('');

<Stack spacing={2}>
  <TextField
    label="Basic Input"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    fullWidth
  />
  <TextField label="Required" required fullWidth />
  <TextField label="Disabled" disabled fullWidth />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Forms, search bars, filters (e.g., user details form, device
        name input, search users)
      </Typography>
    </Paper>
  );
}
