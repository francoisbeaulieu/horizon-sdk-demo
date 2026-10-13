/**
 * Call enrichment service.
 *
 * Bridges the SDK's live call-event stream to the demo's UI: when a call rings
 * in, it looks the caller up in the mock CRM (`mocks/crm.ts`), stores the
 * enriched record, and broadcasts it on the event bus so the `CallerInfoWidget`
 * can render a populated caller card. On call-ended it clears the record.
 *
 * In production the CRM lookup would be a real API call; everything else (the
 * store + event contract) would stay the same.
 */
import type { CallEvent, FlowEventBus } from '@netsapiens/flow-sdk';

import type { CrmRecord } from '../mocks/crm';
import { lookupCrmRecord, normalizePhoneNumber } from '../mocks/crm';

/** The vendor CRM this demo "calls" to enrich a caller. */
const VENDOR_NAME = 'Example CRM';
const VENDOR_CRM_BASE_URL = 'https://app.example-crm.example';

/**
 * Resolve a caller from the CRM, logging the request/response.
 *
 * In production this is a real authenticated request to the vendor CRM —
 * see the `fetchCrmRecord` stub in `pages/CrmIntegrationPage.tsx`. Here it
 * resolves from the mock directory, but we log the GET it *would* make (with the
 * remoteAuth-brokered token) and the record it returns, so the third-party CRM
 * call behind the caller card is visible in the console on each incoming call.
 */
function fetchCrmContact(phone: string): CrmRecord | undefined {
  const url = `${VENDOR_CRM_BASE_URL}/api/contacts/lookup?phone=${encodeURIComponent(phone)}`;
  console.groupCollapsed(
    `%c[${VENDOR_NAME}]%c CRM lookup for ${phone}`,
    'color:#7b61ff;font-weight:600',
    'color:inherit',
  );
  console.info('→ GET', url);
  console.info('  headers', {
    Authorization: 'Bearer <vendor token from auth.requestRemoteAuth>',
  });

  const record = lookupCrmRecord(phone);
  if (record) {
    console.info('← 200 OK', record);
  } else {
    console.info(`← 404 Not Found — no contact for ${phone}`);
  }
  console.groupEnd();
  return record;
}

/** Enriched active-call record shared between this service and CallerInfoWidget. */
export interface CallerInfo {
  callId: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'answered' | 'missed' | 'ended';
  timestamp: number;
  callerName?: string;
  company?: string;
  lastContact?: string;
  notes?: string;
  callCount?: number;
}

/** In-memory store of active calls, shared across component instances. */
export const activeCallsStore = new Map<string, CallerInfo>();

/** Custom events the service emits on the host/remote event bus. */
export const CALL_UPDATED_EVENT = 'demo:call-updated';
export const CALL_REMOVED_EVENT = 'demo:call-removed';

function statusForEvent(type: CallEvent['type']): CallerInfo['status'] {
  if (type === 'call-answered') return 'answered';
  if (type === 'call-missed') return 'missed';
  return 'ringing';
}

/**
 * Build a softphone call handler bound to the given event bus. Pass the result
 * to the `sdk.streams.softphone` methods (see App.tsx). Updates
 * `activeCallsStore` and emits `demo:call-updated` / `demo:call-removed` for
 * the CallerInfoWidget.
 *
 * A `CallEvent` names the other party (`remote`) rather than from/to, so the
 * direction decides which side the user's own extension was on.
 */
export function createCallEventHandler(
  eventBus: FlowEventBus,
  ownExtension = '',
) {
  return (event: CallEvent) => {
    if (event.type === 'call-ended') {
      activeCallsStore.delete(event.callId);
      eventBus.emit(CALL_REMOVED_EVENT, event.callId);
      return;
    }

    const remote = event.remote.number;
    const record = fetchCrmContact(normalizePhoneNumber(remote));
    const inbound = event.direction === 'inbound';

    const enriched: CallerInfo = {
      callId: event.callId,
      from: inbound ? remote : ownExtension,
      to: inbound ? ownExtension : remote,
      direction: event.direction,
      status: statusForEvent(event.type),
      timestamp: Date.now(),
      callerName: record?.name ?? event.remote.name,
      company: record?.company,
      lastContact: record?.lastContact,
      notes: record?.notes,
      callCount: record?.callCount,
    };

    activeCallsStore.set(event.callId, enriched);
    eventBus.emit(CALL_UPDATED_EVENT, enriched);
  };
}
