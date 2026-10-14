/** Showcase section: Switch toggle. */
import { useState } from 'react';
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function SwitchSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Switch, Typography, Stack, Paper } = ui || {};
  const [switchValue, setSwitchValue] = useState(true);
  if (!Paper || !Typography || !Stack || !Switch) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Switch
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Toggle on/off
      </Typography>

      <Stack spacing={1}>
        <Switch
          label={t?.('ENABLED') ?? 'Enabled'}
          checked={switchValue}
          onChange={(e) => setSwitchValue(e.target.checked)}
        />
        <Switch label={t?.('DISABLED') ?? 'Disabled'} disabled />
      </Stack>

      <SectionCode>
        {`const { Switch } = flowContext.ui;
const [switchValue, setSwitchValue] = useState(true);

<Stack spacing={1}>
  <Switch
    label="Enabled"
    checked={switchValue}
    onChange={(e) => setSwitchValue(e.target.checked)}
  />
  <Switch label="Disabled" disabled />
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Settings, feature toggles (e.g., enable DND, activate
        voicemail, toggle dark mode)
      </Typography>
    </Paper>
  );
}
