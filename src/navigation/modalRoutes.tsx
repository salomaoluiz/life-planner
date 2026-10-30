import { ComponentType } from "react";

import { FinancialSectionPicker, Invite, QuickAdd } from "@screens";
import { VersionsModal } from "@screens/Config/modals";
import { AddNewFamily, AddNewFamilyMember } from "@screens/Family/modals";
import { BusinessFeedback } from "@screens/Feedback";
import { NewAccountModal } from "@screens/Financial/Accounts/modals";
import { NewCreditCardModal } from "@screens/Financial/Cards/modals";
import { NewCategoryModal } from "@screens/Financial/Categories/modals";
import { EarlyPaymentModal } from "@screens/Financial/EarlyPayment";
import { InstallmentEditModal } from "@screens/Financial/InstallmentEdit";
import { InvoiceModal } from "@screens/Financial/Invoice";
import { PrepaymentModal } from "@screens/Financial/Prepayment";
import { RefundModal } from "@screens/Financial/Refund";
import { NewTagModal } from "@screens/Financial/Tags/modals";
import { NewTransactionModal } from "@screens/Financial/Transactions/modals";
import { ModalName } from "@screens/Navigation/models/modalPath";
import { NewStockItemModal } from "@screens/Stock/modals";

// Add a modal here (and its name to MODAL_NAMES); the catch-all route serves `<base>/<name>`.
export const MODAL_ROUTES: Record<ModalName, ComponentType> = {
  add_new_account: NewAccountModal,
  add_new_category: NewCategoryModal,
  add_new_credit_card: NewCreditCardModal,
  add_new_family: AddNewFamily,
  add_new_family_member: AddNewFamilyMember,
  add_new_stock_item: NewStockItemModal,
  add_new_tag: NewTagModal,
  add_new_transaction: NewTransactionModal,
  business_feedback: BusinessFeedback,
  card_early_payment: EarlyPaymentModal,
  card_refund: RefundModal,
  edit_installment: InstallmentEditModal,
  invite: Invite,
  invoice_detail: InvoiceModal,
  prepay_installments: PrepaymentModal,
  quick_add: QuickAdd,
  section_picker: FinancialSectionPicker,
  versions: VersionsModal,
};
