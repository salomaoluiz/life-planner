const accountFormTestIds = {
  archivedSwitch: "financial.account-form.archived-switch",
  archiveWarning: "financial.account-form.archive-warning",
  balanceInput: "financial.account-form.balance-input",
  currency: "financial.accounts.modal.currency",
  deleteButton: "financial.account-form.delete-button",
  deleteDialog: "financial.account-form.delete-dialog",
  favoriteSwitch: "financial.account-form.favorite-switch",
  formError: "financial.account-form.form-error",
  icon: "financial.account-form.icon",
  nameInput: "financial.account-form.name-input",
  owner: "financial.account-form.owner",
  saveButton: "financial.account-form.save-button",
  sheet: "financial.account-form.sheet",
  type: "financial.accounts.modal.type",
  // Spec 101: one tile (web/tablet) or chip (mobile) per type.
  typeOption: (type: string) => `financial.accounts.modal.type.${type}`,
} as const;

export default accountFormTestIds;
