/**
 * Analytics Widget Extension
 * Computes call statistics from the live filtered rows published by DataTable.
 * No API calls — the data is already in memory from the page's own query.
 */
import type { ExtensionComponentProps } from '@netsapiens/flow-sdk';
import { useMemo } from 'react';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

// Shape of a CDR row as published by the call-logs DataTable
interface CdrRow {
  'call-total-duration-seconds'?: number;
  'call-start-datetime'?: string;
  'call-direction'?: number; // 1=inbound, 2=missed, 3=inter-company, -1=not-routed, 0=outbound
}

interface CallLogsPageContext {
  rows?: CdrRow[];
}

function fmtDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type StatKey = 'totalCalls' | 'avgDuration' | 'peakHour' | 'successRate';

interface StatConfig {
  key: StatKey;
  label: string;
  color: string;
  /** Appended to the value, unless the value is the em-dash placeholder. */
  suffix?: string;
}

const STAT_CONFIGS: readonly StatConfig[] = [
  { key: 'totalCalls', label: 'Total Calls', color: 'primary.main' },
  { key: 'avgDuration', label: 'Avg Duration', color: 'success.main' },
  { key: 'peakHour', label: 'Peak Hour', color: 'warning.main' },
  {
    key: 'successRate',
    label: 'Success Rate',
    suffix: '%',
    color: 'secondary.main',
  },
];

export function AnalyticsWidget({
  context,
  ...marker
}: ExtensionComponentProps & ZoneMarkerProps) {
  const { Paper, Typography } = context.ui ?? {};
  // Read the raw reference: defaulting with `?? []` out here would allocate a
  // new array every render and the memo below would never hold.
  const pageRows = (context.pageContext as CallLogsPageContext | undefined)
    ?.rows;

  const stats = useMemo<Record<StatKey, string | number>>(() => {
    const rows = pageRows ?? [];
    const n = rows.length;

    if (n === 0) {
      return {
        totalCalls: '—',
        avgDuration: '—',
        peakHour: '—',
        successRate: '—',
      };
    }

    // Average call duration
    const totalSecs = rows.reduce(
      (sum, r) => sum + (r['call-total-duration-seconds'] ?? 0),
      0,
    );
    const avgDuration = fmtDuration(totalSecs / n);

    // Peak hour — bucket by hour of call-start-datetime.
    // The API returns datetimes as "YYYY-MM-DDTHH:mm:ssZ[Timezone]" which is non-standard
    // ISO 8601 — strip the bracket timezone suffix before parsing (same as formatDate does).
    const hourCounts = new Array(24).fill(0) as number[];
    let parsedDateCount = 0;
    rows.forEach((r) => {
      if (r['call-start-datetime']) {
        const cleaned = r['call-start-datetime'].replace(/Z\[.+\]$/, '');
        const hour = new Date(cleaned).getHours();
        if (!isNaN(hour)) {
          hourCounts[hour]++;
          parsedDateCount++;
        }
      }
    });
    let peakHour = '—';
    if (parsedDateCount > 0) {
      const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
      const h12 = maxHour % 12 || 12;
      peakHour = `${h12}:00 ${maxHour < 12 ? 'AM' : 'PM'}`;
    }

    // Success rate — exclude missed (2) and not-routed (-1)
    const successful = rows.filter(
      (r) => r['call-direction'] !== 2 && r['call-direction'] !== -1,
    ).length;
    const successRate = Number(((successful / n) * 100).toFixed(1));

    return { totalCalls: n, avgDuration, peakHour, successRate };
  }, [pageRows]);

  if (!Paper || !Typography) return null;

  return (
    <Paper
      {...marker}
      variant='outlined'
      sx={{
        p: 2.5,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        width: '100%',
        alignSelf: 'stretch',
      }}
    >
      {STAT_CONFIGS.map(({ key, label, color, suffix }) => (
        <Paper
          key={key}
          variant='outlined'
          sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}
        >
          <Typography variant='caption' color='text.secondary'>
            {label}
          </Typography>
          <Typography variant='h5' fontWeight={600} sx={{ color }}>
            {stats[key]}
            {suffix && stats[key] !== '—' ? suffix : ''}
          </Typography>
        </Paper>
      ))}
    </Paper>
  );
}
