import { render } from "@tests";

import { InvoiceModal } from "../";
import { makeInvoice } from "../../Transactions/mocks/invoice.mocks";
import { useInvoiceViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useInvoiceViewModel> = {
  accountId: undefined,
  accountOptions: [{ label: "Checking", value: "a1" }],
  errorMessage: undefined,
  formErrorKey: undefined,
  invoice: makeInvoice(),
  isLoading: false,
  isPaying: false,
  isPayOpen: false,
  isSubmitDisabled: true,
  isUndoing: false,
  isUndoOpen: false,
  method: "ACCOUNT",
  onAccountChange: jest.fn(),
  onAddPurchasePress: jest.fn(),
  onClose: jest.fn(),
  onCreditPress: jest.fn(),
  onEarlyPaymentPress: jest.fn(),
  onMethodChange: jest.fn(),
  onPaidOnChange: jest.fn(),
  onPayClose: jest.fn(),
  onPayConfirm: jest.fn(),
  onPayPress: jest.fn(),
  onPurchasePress: jest.fn(),
  onRefundPress: jest.fn(),
  onRetry: jest.fn(),
  onUndoCancel: jest.fn(),
  onUndoConfirm: jest.fn(),
  onUndoPress: jest.fn(),
  paidOn: new Date(2026, 10, 5),
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useInvoiceViewModel).mockReturnValue(viewModel);
  render(<InvoiceModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, setup };
