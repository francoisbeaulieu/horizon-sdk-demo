/**
 * Small pieces every Live Operations card shares — all kit components.
 */
import type { StreamStatus } from '@netsapiens/flow-sdk';
import type { ReactNode } from 'react';
import { useFlowContext } from '@netsapiens/flow-sdk';

import { isBlocked } from './format';

/**
 * What the stream is doing: a status chip and the SDK call while it flows; the
 * host's own message in an Alert when it does not.
 */
export function StreamNote({
  status,
  call,
}: {
  status: StreamStatus;
  call: string;
}) {
  const { ui } = useFlowContext();
  const { Alert, Chip, Stack, Tooltip } = ui ?? {};
  if (!Alert || !Chip || !Stack || !Tooltip) return null;

  if (status.state === 'refused') {
    return <Alert severity='info'>{status.message}</Alert>;
  }
  if (status.state === 'unavailable') {
    return (
      <Alert severity='warning'>
        The live connection dropped{status.retrying ? '; reconnecting…' : '.'}
      </Alert>
    );
  }
  if (status.state === 'unconfirmed') {
    return (
      <Alert severity='warning'>
        This server did not answer the stream request. It may predate
        sdk.streams.
      </Alert>
    );
  }
  const live = status.state === 'live';
  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      <Tooltip title={call}>
        <Chip
          size='small'
          variant='outlined'
          color={live ? 'success' : 'default'}
          label={
            live
              ? status.snapshot
                ? 'Live · snapshot'
                : 'Live'
              : 'Connecting…'
          }
        />
      </Tooltip>
    </Stack>
  );
}

/**
 * The host's empty state (`ui.templates.PageComponents.EmptyState`), with the
 * kit's Icon — the host renders `icon` as given, so a bare iconify name would
 * print as text. Falls back to a quiet line on a host without it.
 */
export function Empty({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description?: string;
}) {
  const { ui } = useFlowContext();
  const EmptyState = ui?.templates?.PageComponents?.EmptyState;
  const Icon = ui?.templates?.Icon;
  const Typography = ui?.Typography;
  if (EmptyState && Icon) {
    return (
      <EmptyState
        icon={<Icon name={icon} size={40} />}
        title={title}
        description={description}
        sx={{ py: 3 }}
      />
    );
  }
  return Typography ? (
    <Typography variant='body2' color='text.secondary'>
      {title}
    </Typography>
  ) : null;
}

/** A card body: the stream note, then the content unless the stream is blocked. */
export function CardBody({
  status,
  call,
  children,
}: {
  status: StreamStatus;
  call: string;
  children: ReactNode;
}) {
  const { ui } = useFlowContext();
  const Stack = ui?.Stack;
  if (!Stack) return null;
  return (
    <Stack spacing={1.5}>
      <StreamNote status={status} call={call} />
      {isBlocked(status) ? null : children}
    </Stack>
  );
}
