/**
 * Call Details side-panel content.
 *
 * Opened from a Call Logs table-row action (see QuickActionButton) to show that
 * the shared side panel can be opened from anywhere with row-specific content.
 * Receives the host `context` + `close`, plus the `row` the action closed over.
 */
import type { SidePanelContentProps } from '@netsapiens/flow-sdk';

interface CallDetailsPanelProps extends SidePanelContentProps {
  row: Record<string, unknown>;
}

function field(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '—';
}

export function CallDetailsPanel({
  context,
  close,
  row,
}: CallDetailsPanelProps) {
  const { Stack, Typography, Divider, Button } = context.ui ?? {};
  if (!Stack || !Typography) return null;

  const from = field(row, 'orig_from_user', 'orig-from-user', 'orig');
  const to = field(row, 'term_to_user', 'term-to-user', 'term');
  const duration = field(row, 'call-total-duration-seconds', 'duration');
  const startTime = field(row, 'call-start-datetime', 'time_start');

  const rows: [string, string][] = [
    ['From', from],
    ['To', to],
    ['Duration (s)', duration],
    ['Started', startTime],
  ];

  return (
    <Stack spacing={2}>
      <Typography variant='body2' color='text.secondary'>
        Details for the selected call, opened from the row’s quick action.
      </Typography>

      {Divider && <Divider />}

      <Stack spacing={1.5}>
        {rows.map(([label, value]) => (
          <Stack
            key={label}
            direction='row'
            justifyContent='space-between'
            spacing={2}
          >
            <Typography variant='body2' color='text.secondary'>
              {label}
            </Typography>
            <Typography
              variant='body2'
              fontWeight={600}
              sx={{ textAlign: 'right' }}
            >
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {Button && (
        <>
          {Divider && <Divider />}
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button variant='text' onClick={close}>
              {context.t?.('CLOSE') ?? 'Close'}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default CallDetailsPanel;
