/**
 * Monospace code block used throughout the Component Showcase. Renders inside
 * the host's themed Paper and adapts its background to the host light/dark theme
 * (reactive via the SDK's useTheme hook).
 */
import { useFlowContext, useTheme } from '@netsapiens/flow-sdk';

export function CodeBlock({ children }: { children: string }) {
  const { ui } = useFlowContext();
  const { theme } = useTheme();
  const Paper = ui?.Paper;
  if (!Paper) return null;

  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2,
        bgcolor: theme === 'dark' ? 'grey.900' : 'grey.50',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'pre',
        maxWidth: '100%',
      }}
    >
      {children}
    </Paper>
  );
}
