/** Showcase section: Card, CardContent, Icon, and `rounded` on Card and Paper. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { SectionCode } from '../SectionCode';

const CARDS = [
  { icon: 'mdi:rocket-launch', title: 'Static card', note: 'Just content' },
  {
    icon: 'mdi:cursor-default-click',
    title: 'Clickable card',
    note: 'Whole surface activates',
  },
];

export default function CardSection() {
  const { ui } = useFlowContext();
  const { Card, CardContent, Icon, Typography, Stack, Paper, Box } = ui || {};
  if (!Paper || !Typography || !Stack || !Card || !CardContent || !Box)
    return null;

  return (
    <Paper rounded>
      <Typography variant='h5' gutterBottom>
        Card &amp; Icon
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        A themed surface that becomes a single activatable control when you give
        it <code>onClick</code>, and any Iconify glyph by name.
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        <code>Card</code> and <code>Paper</code> are square by default, like
        Flow&apos;s own panels. Pass <code>rounded</code> for rounded corners in
        the host&apos;s radius — every card on this demo&apos;s pages does.
        Dashboard cards stay square.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 2,
        }}
      >
        {CARDS.map((c, i) => (
          <Card
            rounded
            key={c.title}
            {...(i === 1 ? { onClick: () => {} } : {})}
          >
            <CardContent>
              <Stack direction='row' spacing={1.5} alignItems='center'>
                {Icon ? (
                  <Icon
                    icon={c.icon}
                    sx={{ fontSize: 24, color: 'primary.main' }}
                  />
                ) : null}
                <Stack direction='column' spacing={0.25}>
                  <Typography variant='subtitle2'>{c.title}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {c.note}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <SectionCode>
        {`const { Card, CardContent, Icon, Paper } = flowContext.ui;

// Square by default, like the platform's panels. \`rounded\` applies the
// host's radius, so there is no number to write. An sx radius still wins.
<Paper rounded>…</Paper>

// Passing onClick makes the host render a CardActionArea internally, so the
// focus ring, hover state and keyboard activation come for free.
<Card rounded onClick={() => open(row)}>
  <CardContent>
    <Icon icon="mdi:rocket-launch" sx={{ fontSize: 24, color: 'primary.main' }} />
    <Typography variant="subtitle2">Clickable card</Typography>
  </CardContent>
</Card>`}
      </SectionCode>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ mt: 2, display: 'block' }}
      >
        💡 Never wrap a card in your own button to make it clickable — that is
        how you ship one a keyboard cannot reach. <code>onClick</code> does it
        properly.
      </Typography>
    </Paper>
  );
}
