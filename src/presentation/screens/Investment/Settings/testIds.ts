// Spec 113: `investment.settings.<element>`.
const settingsTestIds = {
  card: (index: "cdi" | "ipca" | "selic") =>
    `investment.settings.${index}-card`,
  empty: "investment.settings.empty",
  emptyFetch: "investment.settings.empty-fetch",
  error: "investment.settings.error",
  errorRetry: "investment.settings.error-retry",
  fx: "investment.settings.fx",
  history: {
    changes: "investment.settings.history.changes",
    chart: "investment.settings.history.chart",
    close: "investment.settings.history.close",
    follower: (assetId: string) =>
      `investment.settings.history.follower-${assetId}`,
    followers: "investment.settings.history.followers",
    modal: "investment.settings.history.modal",
    open: (index: string) => `investment.settings.history.open-${index}`,
    period: (id: string) => `investment.settings.history.period-${id}`,
  },
  refresh: "investment.settings.refresh",
  screen: "investment.settings.screen",
  source: "investment.settings.source",
  staleBanner: "investment.settings.stale-banner",
  tooMany: "investment.settings.too-many",
  updatedAt: "investment.settings.updated-at",
};

export default settingsTestIds;
