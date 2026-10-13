/**
 * Contact Form Banner Extension
 * Zone: `form-section-before` — injected at the top of the Contacts add/edit form.
 *
 * Surfaces Example CRM (mock) data above the form:
 *  - edit: the matched contact's CRM record, resolved from the shared mock
 *    directory (the same source the CallerInfoWidget uses);
 *  - add:  there's no contact yet, so we show recently-added Example CRM
 *    contacts for context.
 */
import { type ExtensionComponentProps } from '@netsapiens/flow-sdk';

import type { CrmRecord } from '../mocks/crm';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import {
  lookupCrmRecord,
  MOCK_CRM_DIRECTORY,
  normalizePhoneNumber,
} from '../mocks/crm';

const VENDOR_NAME = 'Example CRM';

/** Contacts surfaced as "recently added" on the add form. */
const RECENT_CONTACT_KEYS = ['+15551234567', '+15559876543', '2009'];

/**
 * Find this contact's CRM record by scanning the form's values for a
 * number/extension that's in the mock directory — robust to whichever field
 * (phone, extension, …) the host form happens to use.
 */
function findCrmRecord(
  formData?: Record<string, unknown>,
): CrmRecord | undefined {
  if (!formData) return undefined;
  for (const value of Object.values(formData)) {
    if (typeof value !== 'string' || !value) continue;
    const record = lookupCrmRecord(normalizePhoneNumber(value));
    if (record) return record;
  }
  return undefined;
}

export default function ContactFormBanner({
  context,
  ...marker
}: ExtensionComponentProps & ZoneMarkerProps) {
  const { Alert, Stack, Typography, Divider } = context.ui ?? {};
  if (!Alert || !Stack || !Typography) return null;

  const pageContext = context.pageContext as {
    formType: string;
    mode: 'add' | 'edit';
    formData?: Record<string, unknown>;
  };

  const record =
    pageContext.mode === 'edit'
      ? findCrmRecord(pageContext.formData)
      : undefined;

  // Edit + matched: show the contact's Example CRM record.
  if (record) {
    return (
      <Alert {...marker} severity='info' sx={{ width: '100%' }}>
        <Typography variant='body2' fontWeight={600}>
          {VENDOR_NAME} record
        </Typography>
        <Typography variant='body2'>
          {record.name} · {record.company}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Last contact: {record.lastContact} • {record.callCount} lifetime calls
        </Typography>
        {record.notes && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontStyle: 'italic', mt: 0.5 }}
          >
            {record.notes}
          </Typography>
        )}
      </Alert>
    );
  }

  // Add (or edit with no match): show recently-added Example CRM contacts.
  const recent = RECENT_CONTACT_KEYS.map((k) => MOCK_CRM_DIRECTORY[k]).filter(
    Boolean,
  ) as CrmRecord[];

  return (
    <Alert {...marker} severity='info' sx={{ width: '100%' }}>
      <Typography variant='body2' fontWeight={600}>
        Recently added in {VENDOR_NAME}
      </Typography>
      {Divider && <Divider sx={{ my: 0.5 }} />}
      <Stack spacing={0.25}>
        {recent.map((c) => (
          <Typography key={c.name} variant='body2' color='text.secondary'>
            • {c.name} — {c.company}
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
}
