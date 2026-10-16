const installmentEditTestIds = {
  amount: "financial.installmentEdit.amount",
  card: "financial.installmentEdit.card",
  category: "financial.installmentEdit.category",
  count: "financial.installmentEdit.count",
  date: "financial.installmentEdit.date",
  description: "financial.installmentEdit.description",
  formError: "financial.installmentEdit.form-error",
  paidHelper: "financial.installmentEdit.paid-helper",
  recalcConfirm: "financial.installmentEdit.recalc-confirm",
  save: "financial.installmentEdit.save",
  scope: "financial.installmentEdit.scope",
  seePlan: "financial.installmentEdit.see-plan",
  sheet: "financial.installmentEdit.sheet",
} as const;

const installmentPlanTestIds = {
  count: "financial.installmentPlan.count",
  delete: "financial.installmentPlan.delete",
  deleteConfirm: "financial.installmentPlan.delete-confirm",
  row: "financial.installmentPlan.row",
  sheet: "financial.installmentPlan.sheet",
  total: "financial.installmentPlan.total",
} as const;

export { installmentEditTestIds, installmentPlanTestIds };
