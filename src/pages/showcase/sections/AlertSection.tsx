/** Showcase section: Alert severities. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function AlertSection() {
  const { ui } = useFlowContext();
  const { Alert, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !Alert) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Alert
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Feedback messages with different severity levels
      </Typography>

      <Stack spacing={2}>
        <Alert severity='info'>This is an info alert — check it out!</Alert>
        <Alert severity='success'>
          This is a success alert — check it out!
        </Alert>
        <Alert severity='warning'>
          This is a warning alert — check it out!
        </Alert>
        <Alert severity='error'>This is an error alert — check it out!</Alert>
      </Stack>

      <SectionCode>
        {`const { Alert } = flowContext.ui;

<Stack spacing={2}>
  <Alert severity="info">This is an info alert — check it out!</Alert>
  <Alert severity="success">This is a success alert — check it out!</Alert>
  <Alert severity="warning">This is a warning alert — check it out!</Alert>
  <Alert severity="error">This is an error alert — check it out!</Alert>
</Stack>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: Form validation, notifications, status messages (e.g., save
        confirmations, error messages, warnings)
      </Typography>
    </Paper>
  );
}
