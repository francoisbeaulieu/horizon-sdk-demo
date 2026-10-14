/** Showcase section: Checkbox. */
import { useState } from 'react';
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function CheckboxSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Checkbox, Typography, Stack, Paper } = ui || {};
  const [checked, setChecked] = useState(true);
  if (!Paper || !Typography || !Stack || !Checkbox) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Checkbox
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Boolean selection
      </Typography>

      <Stack spacing={1}>
        <Checkbox
          label='Checked'
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <Checkbox label='Unchecked' checked={false} onChange={() => {}} />
        <Checkbox label={t?.('DISABLED') ?? 'Disabled'} disabled />
      </Stack>

      <SectionCode>
        {`const { Checkbox } = flowContext.ui;
const [checked, setChecked] = useState(true);

<Stack spacing={1}>
  <Checkbox
    label="Checked"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
  />
  <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
  <Checkbox label="Disabled" disabled />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Multi-select lists, feature toggles, permissions (e.g., bulk
        user selection, enable call recording, assign permissions)
      </Typography>
    </Paper>
  );
}
