// Empty since spec 100: every screen and modal uses views/Wide.tsx + AdaptiveLayout. The list stays so the coverage
// test keeps its shape; a new screen never goes here (paths are relative to src/presentation/screens).
export const legacyAdaptiveAllowList: string[] = [];

// Routed through app/** or rendered by a screen (not routed) and not a screen of their own.
export const inlineModals = [
  "Financial/Transactions/modals/ExportModal",
  "Financial/Transactions/modals/FiltersModal",
  "Financial/Transactions/modals/ImportWizard",
];

// Excluded for good, with the reason.
export const neverAdaptive: Record<string, string> = {
  Feedback: "barrel of error boundaries and the feedback modal",
  "Feedback/GenericErrorBoundary": "error boundary",
  "Feedback/GlobalBoundary": "error boundary",
  "Financial/IndexRedirect": "redirect",
  "Financial/Layout": "navigation shell (section header), not a screen",
  "Financial/Transactions/pending/ErrorToastHost": "layout host, not a screen",
  "Navigation/containers/AppTabBar": "navigation shell, not a screen",
  "Navigation/containers/LegacyConfigRedirect": "redirect",
  "Navigation/containers/UpdateBanner": "layout host, not a screen",
};
