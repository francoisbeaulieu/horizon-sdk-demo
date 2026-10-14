import type {
  ExtensionComponentProps,
  TableFilterBarContext,
} from '@netsapiens/flow-sdk';
import React, { useState } from 'react';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

type Row = Record<string, unknown>;

/**
 * Is this active call being recorded?
 *
 * NetSapiens doesn't expose one canonical recording flag across endpoints, and
 * the active-calls row may use any of these — so we match all the known shapes
 * defensively (CDRs use `call-recording-status`; the live table has used
 * `call-record-keep`). If your host populates a different field, add it here.
 */
function isRecording(r: Row): boolean {
  const keep = r['call-record-keep'];
  if (keep === 'yes' || keep === true) return true;

  // A non-zero recording status means a recording is active/kept.
  const status = r['call-recording-status'];
  if (status != null && status !== 0 && status !== '0' && status !== false) {
    return true;
  }

  const rec = r['call-recording'] ?? r['recording'];
  return rec === true || rec === 'yes' || rec === 1 || rec === '1';
}

/** A call leg sitting on hold (either party). */
function isOnHold(r: Row): boolean {
  return r['call-orig-info'] === 'held' || r['call-term-info'] === 'held';
}

/** A call currently routed into a call queue. */
function isQueued(r: Row): boolean {
  return (
    r['call-term-uri'] === 'Call-Queue' || r['term_to_uri'] === 'Call-Queue'
  );
}

/** The filters this chip group offers, in display order. */
const FILTERS: { value: string; label: string; match: (r: Row) => boolean }[] =
  [
    { value: 'recorded', label: '● Recording', match: isRecording },
    { value: 'held', label: '⏸ On hold', match: isOnHold },
    { value: 'queued', label: '☎ In queue', match: isQueued },
  ];

export function ActiveCallsRecordingFilter({
  context,
  ...marker
}: ExtensionComponentProps & ZoneMarkerProps) {
  const filterCtx = context.pageContext as TableFilterBarContext | undefined;
  const { ToggleButtonGroup } = context.ui ?? {};
  const [selected, setSelected] = useState<string | null>(null);

  function handleChange(_e: React.SyntheticEvent, value: string | null) {
    setSelected(value);
    const filter = FILTERS.find((f) => f.value === value);
    filterCtx?.onFilterChange(
      filter ? (row) => filter.match(row as Row) : null,
    );
  }

  if (!ToggleButtonGroup) return null;

  return (
    <ToggleButtonGroup
      {...marker}
      value={selected}
      exclusive
      onChange={handleChange}
      options={FILTERS.map(({ value, label }) => ({ value, label }))}
    />
  );
}
