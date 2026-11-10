import { ComponentType, lazy } from "react";

import { ModalName } from "@screens/Navigation/models/modalPath";

// Every modal is its own chunk on web (spec 089): none of them ships in the entry bundle.
type ModalModule = Record<string, ComponentType>;

function lazyModal(
  load: () => Promise<object>,
  key = "default",
): ComponentType {
  return lazy<ComponentType>(async () => {
    const loaded = (await load()) as unknown as ModalModule;

    return { default: loaded[key] };
  });
}

// Add a modal here (and its name to MODAL_NAMES); the catch-all route serves `<base>/<name>`.
export const MODAL_ROUTES: Record<ModalName, ComponentType> = {
  add_new_account: lazyModal(
    async () => import("@screens/Financial/Accounts/modals"),
    "NewAccountModal",
  ),
  add_new_category: lazyModal(
    async () => import("@screens/Financial/Categories/modals"),
    "NewCategoryModal",
  ),
  add_new_credit_card: lazyModal(
    async () => import("@screens/Financial/Cards/modals"),
    "NewCreditCardModal",
  ),
  add_new_family: lazyModal(
    async () => import("@screens/Family/modals"),
    "AddNewFamily",
  ),
  add_new_family_member: lazyModal(
    async () => import("@screens/Family/modals"),
    "AddNewFamilyMember",
  ),
  add_new_stock_item: lazyModal(
    async () => import("@screens/Stock/modals"),
    "NewStockItemModal",
  ),
  add_new_tag: lazyModal(
    async () => import("@screens/Financial/Tags/modals"),
    "NewTagModal",
  ),
  add_new_transaction: lazyModal(
    async () =>
      import("@screens/Financial/Transactions/modals/NewTransactionModal"),
  ),
  business_feedback: lazyModal(
    async () => import("@screens/Feedback"),
    "BusinessFeedback",
  ),
  card_early_payment: lazyModal(
    async () => import("@screens/Financial/EarlyPayment"),
    "EarlyPaymentModal",
  ),
  card_refund: lazyModal(
    async () => import("@screens/Financial/Refund"),
    "RefundModal",
  ),
  confirm_payment: lazyModal(
    async () => import("@screens/Financial/ConfirmPayment"),
    "ConfirmPaymentModal",
  ),
  confirm_projected: lazyModal(
    async () => import("@screens/Financial/ConfirmProjected"),
    "ConfirmProjectedModal",
  ),
  edit_installment: lazyModal(
    async () => import("@screens/Financial/InstallmentEdit"),
    "InstallmentEditModal",
  ),
  investment_asset: lazyModal(
    async () => import("@screens/Investment/Modals/AssetModal"),
  ),
  investment_operation: lazyModal(
    async () => import("@screens/Investment/Modals/OperationModal"),
  ),
  investment_valuation: lazyModal(
    async () => import("@screens/Investment/Modals/ValuationModal"),
  ),
  invite: lazyModal(async () => import("@screens/Invite")),
  invoice_detail: lazyModal(
    async () => import("@screens/Financial/Invoice"),
    "InvoiceModal",
  ),
  prepay_installments: lazyModal(
    async () => import("@screens/Financial/Prepayment"),
    "PrepaymentModal",
  ),
  quick_add: lazyModal(async () => import("@screens/QuickAdd")),
  section_picker: lazyModal(
    async () => import("@screens/Financial/SectionPicker"),
  ),
  versions: lazyModal(
    async () => import("@screens/Config/modals"),
    "VersionsModal",
  ),
};
