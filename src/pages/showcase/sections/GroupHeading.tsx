/** A divider between showcase groups, so a long page still reads as sections. */
import { useFlowContext } from '@netsapiens/flow-sdk';

export type GroupHeadingProps = {
  /** The group name, e.g. "Inputs". */
  title: string;
  /** One line on what belongs in the group and why. */
  blurb: string;
};

export default function GroupHeading({ title, blurb }: GroupHeadingProps) {
  const { ui } = useFlowContext();
  const { Typography, Box } = ui || {};
  if (!Typography || !Box) return null;

  return (
    <Box sx={{ pt: 3, pb: 0.5 }}>
      <Typography
        variant='overline'
        color='primary.main'
        sx={{ letterSpacing: '0.08em' }}
      >
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {blurb}
      </Typography>
    </Box>
  );
}
