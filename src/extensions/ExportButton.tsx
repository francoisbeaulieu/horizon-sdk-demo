/**
 * Export action — contributed to `page-header-actions` on several pages.
 *
 * Declared, not rendered. The previous version of this file rendered its own
 * `<Button variant='text' sx={{ px: 1 }}>`, which is how an app ends up with a
 * header button that does not match the page it sits on: the house style for a
 * secondary action (`variant="soft" color="neutral"`) was something the app had
 * to know and restate, and the raw MUI variants stayed reachable.
 *
 * Here the app states only what the button *is* — a secondary action — and the
 * host renders it exactly as it renders its own. There is no variant to get
 * wrong and no `sx` to drift.
 *
 * Page data still reaches the handler: `onClick` receives the same `pageContext`
 * the component path received, so the export can act on the user's selection.
 */
import type {
  ExtensionAction,
  ExtensionActionContext,
} from '@netsapiens/flow-sdk';

/** Shape of the table state the host publishes into `pageContext`. */
interface TablePageContext {
  rows?: unknown[];
  data?: unknown[];
  selectedRows?: unknown[];
  selected?: unknown[];
}

function handleExport({ route, params, pageContext }: ExtensionActionContext) {
  // Which page are we on? The route is handed to an action, same as to a component.
  const pageType = route.split('/').filter(Boolean).pop() ?? 'page';

  // The host hands the current table state to this zone via `pageContext` — the
  // user's selection when there is one, otherwise the full row set. A real app
  // would stream these rows to a file or an external system.
  const ctx = (pageContext ?? {}) as TablePageContext;
  const selectedRows = ctx.selectedRows ?? ctx.selected ?? null;
  const allRows = ctx.rows ?? ctx.data ?? null;

  console.groupCollapsed(`[Demo App] 📥 Export requested from "${pageType}"`);
  console.log('Route:', route);
  console.log('Params:', params);
  console.log('Selected rows:', selectedRows);
  console.log('All rows:', allRows);
  console.groupEnd();

  const exportData = selectedRows?.length ? selectedRows : allRows;
  const count = Array.isArray(exportData) ? exportData.length : 0;
  alert(
    `Exporting ${count} row(s) from ${pageType}… (see console for the dataset)`,
  );
}

/**
 * One registration may carry several actions, and several apps may target the
 * same zone — the host orders them by `priority`, then array order. Adding a
 * second button here is a new array entry, not a second registration.
 */
export const exportActions: ExtensionAction[] = [
  {
    id: 'export-data',
    label: 'Export data',
    icon: 'material-symbols:download',
    // Also the default; stated because it is the point of this example.
    intent: 'secondary',
    tooltip: 'Export the current rows, or your selection',
    // Kept so the existing Playwright contract still resolves this button.
    'data-testid': 'sdk-demo-ext-export-button',
    onClick: handleExport,
  },
];
