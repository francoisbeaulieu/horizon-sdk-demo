/**
 * "CRM Status (SDK)" — a dynamic column merged into the host's domain Contacts
 * grid, showing whether the demo's CRM has reconciled each contact.
 *
 * This replaces a "Priority" column that used to sit on Call Logs, and the
 * reasons it was removed are the design brief for this one:
 *
 *   - **It was on the wrong page.** Call Logs is one of the busiest tables in
 *     the platform. A column an app invented, on a page everyone reads daily,
 *     gets treated as platform data.
 *   - **It was misleading.** "Priority" was derived from call duration and
 *     direction by this app's own rule, but nothing on screen said so, so it
 *     read as a rating the platform had assigned.
 *
 * Hence the label. `(SDK)` is a caveat in the header itself, where a reader
 * meets it before the value — a column that cannot be mistaken for native is
 * the honest shape for an app-owned column, and it costs one word.
 *
 * The state comes from the same fixture the CRM Sync page and the sync-queue
 * widget read, so the three surfaces agree about any given contact. That is the
 * point worth making to a partner: a dynamic column is not a decoration bolted
 * onto someone else's grid, it is your app's data, in the place the user is
 * already looking.
 *
 * Also the reference for the second argument the host hands `renderCell`: the
 * same `ExtensionContext` zone extensions get. Rendering from `context.ui` is
 * what makes the cell follow the host's light/dark toggle — the hardcoded-hex
 * version this pattern replaced looked identical in both schemes.
 */
import type { ExtensionContext } from '@netsapiens/flow-sdk';

import type { CrmStatus } from '../mocks/crmStatus';
import { type ZoneMarkerProps } from '../integration/withZoneTestId';
import { crmStatusOf } from '../mocks/crmStatus';

interface CrmStatusProps {
  /** DataGrid renderCell params — only the row record is read here. */
  params: { row: Record<string, unknown> };
  /** Host-built extension context (`ui`, `theme`, `t`, scoped `eventBus`). */
  context: ExtensionContext;
}

/** Host semantic colour slots — the host maps these per colour scheme. */
const CHIP_COLOR: Record<
  CrmStatus,
  'success' | 'warning' | 'error' | 'default'
> = {
  Synced: 'success',
  Queued: 'warning',
  Failed: 'error',
  'Not in CRM': 'default',
};

/**
 * Fallback palette for when the host UI surface isn't available. These are
 * values the app owns, so they branch on `context.theme` rather than being read
 * from `ui.theme` — those tokens are a snapshot and go stale after a toggle.
 */
const FALLBACK_COLOR: Record<'light' | 'dark', Record<CrmStatus, string>> = {
  light: {
    Synced: '#088759',
    Queued: '#d97706',
    Failed: '#dc2626',
    'Not in CRM': '#6b7280',
  },
  dark: {
    Synced: '#35b084',
    Queued: '#fbbf24',
    Failed: '#f87171',
    'Not in CRM': '#9ca3af',
  },
};

export function CrmStatusCell({
  params,
  context,
  ...marker
}: CrmStatusProps & ZoneMarkerProps) {
  const { Chip } = context.ui ?? {};
  const status = crmStatusOf(params.row);

  // Preferred path: a host component, themed by the host, so the cell re-colours
  // with the colour scheme without this app tracking the mode at all.
  if (Chip) {
    return (
      <Chip
        {...marker}
        size='small'
        variant='outlined'
        color={CHIP_COLOR[status]}
        label={status}
      />
    );
  }

  // Degraded path: own markup, so pick a mode-appropriate value per the theming
  // contract. `context.theme` is the reactive signal — the host rebuilds the
  // column context when the scheme flips.
  const color =
    FALLBACK_COLOR[context.theme === 'dark' ? 'dark' : 'light'][status];

  return (
    <div
      {...marker}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: `${color}20`,
        color,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {status}
    </div>
  );
}
