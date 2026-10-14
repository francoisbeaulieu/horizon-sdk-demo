/** DemoPage tab: Route Patterns — how extensions target host pages. */
import { useFlowContext } from '@netsapiens/flow-sdk';

import { PATTERNS } from '../../content/demoContent';

const HEADINGS = ['Pattern', 'Type', 'Example match'];

export default function PatternsPanel() {
  const { ui } = useFlowContext();
  const { Paper, Box, Typography } = ui || {};
  if (!Paper || !Box || !Typography) return null;

  return (
    <Paper rounded>
      <Typography variant='h6' gutterBottom>
        Route pattern matching
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Each extension lists the routes it applies to. Patterns support
        wildcards, named params, prefixes, and a global match — so one
        registration can target many pages.
      </Typography>

      {/* The kit exposes no Table primitives, so the table ELEMENTS come from
          the host `Box` via `component` — real <table> semantics, with every
          color resolved from the live palette through `sx`. */}
      <Paper rounded background={1} sx={{ overflowX: 'auto' }}>
        <Box
          component='table'
          sx={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <Box component='thead'>
            <Box
              component='tr'
              sx={{ borderBottom: '2px solid', borderColor: 'divider' }}
            >
              {HEADINGS.map((heading) => (
                <Box
                  key={heading}
                  component='th'
                  sx={{ textAlign: 'left', p: 1 }}
                >
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    fontWeight={600}
                  >
                    {heading}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box component='tbody'>
            {PATTERNS.map((p) => (
              <Box
                key={p.pattern}
                component='tr'
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Box component='td' sx={{ p: 1 }}>
                  <Typography
                    variant='body2'
                    component='code'
                    fontFamily='monospace'
                  >
                    {p.pattern}
                  </Typography>
                </Box>
                <Box component='td' sx={{ p: 1 }}>
                  <Typography variant='body2'>{p.kind}</Typography>
                </Box>
                <Box component='td' sx={{ p: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {p.matches}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
}
