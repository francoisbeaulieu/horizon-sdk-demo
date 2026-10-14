/** Showcase section: ActivityList — the host's feed row. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const ROWS = [
  {
    id: '1',
    tone: 'success' as const,
    primary: 'Answered · Alice Williams',
    secondary: '+1 302 555 1000',
    meta: '9:41 AM',
  },
  {
    id: '2',
    tone: 'error' as const,
    primary: 'Missed · Reid Sellers',
    secondary: '+1 770 555 0188',
    meta: '9:12 AM',
  },
  {
    id: '3',
    tone: 'warning' as const,
    primary: 'Voicemail · Andrew Lighterink',
    secondary: '+1 904 555 0163',
    meta: '8:56 AM',
  },
  {
    id: '4',
    tone: 'info' as const,
    primary: 'Transferred · Tony Friar',
    secondary: '+1 415 555 0142',
    meta: '8:30 AM',
  },
];

export default function ActivityListSection() {
  const { ui } = useFlowContext();
  const { ActivityList, Typography, Stack, Paper } = ui || {};
  if (!Paper || !Typography || !Stack || !ActivityList) return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        ActivityList
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        The feed row the host&rsquo;s own notice and alert lists draw — a status
        dot, a label, an optional middle column and a right-aligned time.
      </Typography>

      <ActivityList rows={ROWS} width={640} emptyMessage='Nothing yet.' />

      <SectionCode>
        {`const { ActivityList } = flowContext.ui;

<ActivityList
  width={widget.pixel.width}   // the host drops the middle column when narrow
  emptyMessage="Nothing in this window."
  rows={events.map((e) => ({
    id: e.id,
    tone: 'success',           // semantic, not a colour
    primary: \`Answered · \${e.agent}\`,
    secondary: e.party,
    meta: e.time,
    onClick: () => open(e),    // optional; keyboard-operable when set
  }))}
/>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Pass <code>widget.pixel.width</code> and the host drops the middle
        column on a narrow card rather than truncating three things at once. A
        row with <code>onClick</code> is focusable and fires on Enter or Space.
      </Typography>
    </Paper>
  );
}
