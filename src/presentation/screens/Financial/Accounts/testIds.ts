const accountsTestIds = {
  addButton: "financial.accounts.add-button",
  archivedToggle: "financial.accounts.archived-toggle",
  currencyChip: "financial.accounts.currency-chip",
  emptyState: "financial.accounts.empty-state",
  favoriteStar: "financial.accounts.favorite-star",
  favoriteTag: "financial.accounts.favorite-tag",
  otherCurrencies: "financial.accounts.otherCurrencies",
  otherCurrenciesSubtotal: (code: string) =>
    `financial.accounts.otherCurrencies.subtotal.${code}`,
  ownerFilter: "financial.accounts.owner-filter",
  readOnlyBanner: "financial.accounts.readonly-banner",
  readOnlyToast: "financial.accounts.readonly-toast",
  row: "financial.accounts.row",
  screen: "financial.accounts.screen",
  totalProjected: "financial.accounts.total-projected",
  // Spec 101: one header per account type, with its subtotal.
  typeSection: (type: string) => `financial.accounts.typeSection.${type}`,
  typeSectionSubtotal: (type: string) =>
    `financial.accounts.typeSection.${type}.subtotal`,
} as const;

export default accountsTestIds;
