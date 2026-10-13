/**
 * Table Toolbar Info Extension
 * Zone: `table-toolbar` — the toolbar row above a DataTable. Good for
 * table-scoped actions, hints, or status chips.
 */
import type { ExtensionComponentProps } from '@netsapiens/flow-sdk';

import { type ZoneMarkerProps } from '../integration/withZoneTestId';

export function TableToolbarInfo({
  context,
  ...marker
}: ExtensionComponentProps & ZoneMarkerProps) {
  const { Tooltip, IconButton } = context.ui ?? {};

  const handleClick = () => {
    alert(
      'Tip: filter by direction, then sort by duration to find the calls worth listening to.',
    );
  };

  if (!Tooltip || !IconButton) {
    return (
      <button
        {...marker}
        onClick={handleClick}
        title='Table tips (Demo Extension)'
      >
        ℹ️
      </button>
    );
  }

  return (
    <Tooltip title='Table tips (Demo Extension)'>
      <IconButton
        {...marker}
        icon='material-symbols:info-outline'
        iconSize={18}
        size='small'
        aria-label='table-tips'
        onClick={handleClick}
      />
    </Tooltip>
  );
}
