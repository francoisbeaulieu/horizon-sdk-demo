/** Showcase section: SidePanel drawer + SideTrayComponents building blocks. */
import { useState } from 'react';
import { useFlowContext, useLocale } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

export default function SidePanelSection() {
  const { ui } = useFlowContext();
  // Host keys for the shared vocabulary: these follow the language switch,
  // and a string hard-coded here would be English forever.
  const { t } = useLocale();
  const { Button, IconButton, Chip, Stack, Typography, Paper } = ui || {};
  const { SidePanel, SideTrayComponents } = ui?.templates || {};
  const [open, setOpen] = useState(false);
  if (
    !Paper ||
    !Typography ||
    !Button ||
    !SidePanel ||
    !SideTrayComponents ||
    !Stack
  )
    return null;

  return (
    <Paper>
      <Typography variant='h5' gutterBottom>
        SidePanel
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Right-side drawer shell with pre-built building blocks for details and
        editing
      </Typography>

      <Button variant='contained' onClick={() => setOpen(true)}>
        Open Side Panel Example
      </Button>

      <SidePanel
        title={t?.('USER_DETAILS') ?? 'User details'}
        subtitle='View and edit user information'
        icon={IconButton && <IconButton icon='mdi:account' iconSize={20} />}
        open={open}
        onClose={() => setOpen(false)}
        width='lg'
        footer={
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => setOpen(false)}
            >
              {t?.('CANCEL') ?? 'Cancel'}
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => setOpen(false)}
            >
              {t?.('SAVE_CHANGES') ?? 'Save changes'}
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3}>
          <SideTrayComponents.UserCard
            name='John Doe'
            subtitle='john.doe@example.com'
            trailing={
              Chip && (
                <Chip
                  label={t?.('ROLE_ADMIN') ?? 'Admin'}
                  size='small'
                  color='primary'
                />
              )
            }
          />

          <SideTrayComponents.Divider />

          <SideTrayComponents.Section
            title={t?.('BASIC_INFORMATION') ?? 'Basic information'}
          >
            <SideTrayComponents.Field
              label={t?.('FULL_NAME') ?? 'Full name'}
              value='John Doe'
            />
            <SideTrayComponents.Field
              label={t?.('EMAIL') ?? 'Email'}
              value='john.doe@example.com'
            />
            <SideTrayComponents.Field label='Role' value='Administrator' />
            <SideTrayComponents.Field
              label={t?.('STATUS') ?? 'Status'}
              value={t?.('ACTIVE') ?? 'Active'}
            />
          </SideTrayComponents.Section>

          <SideTrayComponents.Divider />

          <SideTrayComponents.Section title='Edit Information'>
            <SideTrayComponents.Input
              label={t?.('DISPLAY_NAME') ?? 'Display name'}
              value='John Doe'
              placeholder='Enter display name'
            />
            <SideTrayComponents.Input
              label={t?.('PHONE_NUMBER') ?? 'Phone number'}
              value='+1 (555) 123-4567'
              placeholder={t?.('ENTER_PHONE_NUMBER') ?? 'Enter phone number'}
              type='tel'
            />
            <SideTrayComponents.Input
              label={t?.('NOTES') ?? 'Notes'}
              placeholder='Add notes...'
              multiline
              rows={4}
            />
          </SideTrayComponents.Section>
        </Stack>
      </SidePanel>

      <SectionCode>
        {`const { SidePanel, SideTrayComponents } = flowContext.ui.templates;
const [open, setOpen] = useState(false);

<Button variant="contained" onClick={() => setOpen(true)}>Open Side Panel</Button>

<SidePanel
  title="User Details"
  open={open}
  onClose={() => setOpen(false)}
  width="lg"
  footer={<Button onClick={() => setOpen(false)}>Save Changes</Button>}
>
  <Stack spacing={3}>
    <SideTrayComponents.UserCard name="John Doe" subtitle="john.doe@example.com" />
    <SideTrayComponents.Divider />
    <SideTrayComponents.Section title="Basic Information">
      <SideTrayComponents.Field label="Full Name" value="John Doe" />
      <SideTrayComponents.Field label="Email" value="john.doe@example.com" />
    </SideTrayComponents.Section>
  </Stack>
</SidePanel>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Used in: User details, device configuration, editing forms (e.g.,
        Edit User panel, Device Settings, Call Log Details)
      </Typography>
    </Paper>
  );
}
