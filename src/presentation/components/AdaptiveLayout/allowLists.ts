// TEMPORARY (spec 099 FR 14): every screen and modal that existed before the adaptive layout.
// Spec 100 moves them to views/Wide.tsx + AdaptiveLayout and empties this list.
// Paths are relative to src/presentation/screens.
export const legacyAdaptiveAllowList = [
  "Feedback/BusinessFeedback",
  "Financial/ConfirmPayment",
  "Financial/Layout",
  "Financial/Transactions",
  "Financial/Transactions/modals/ExportModal",
  "Financial/Transactions/modals/FiltersModal",
  "Financial/Transactions/modals/ImportWizard",
  "Financial/Transactions/modals/NewTransactionModal",
];

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
  "Financial/Transactions/pending/ErrorToastHost": "layout host, not a screen",
  "Navigation/containers/AppTabBar": "navigation shell, not a screen",
  "Navigation/containers/LegacyConfigRedirect": "redirect",
  "Navigation/containers/UpdateBanner": "layout host, not a screen",
};
