import { render } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import { EarlyPaymentModal } from "../";
import { useEarlyPaymentViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useEarlyPaymentViewModel> = {
  accountId: undefined,
  accountOptions: [{ label: "Checking", value: "a1" }],
  amountCents: 60000,
  card: { id: "card-1", title: "Main card" } as never,
  currency: "BRL",
  date: new Date(2026, 9, 16),
  description: undefined,
  errors: {},
  formErrorKey: undefined,
  invoiceMonth: "2026-10",
  invoices: [
    {
      amountDueCents: 100000,
      month: "2026-10",
      status: "CLOSED",
      totalCents: 100000,
    },
  ],
  isDeleteOpen: false,
  isDeleting: false,
  isEdit: false,
  isLoading: false,
  isLocked: false,
  isSaving: false,
  leftCents: 100000,
  method: "ACCOUNT",
  onAccountChange: jest.fn(),
  onAmountChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDescriptionChange: jest.fn(),
  onInvoiceChange: jest.fn(),
  onMethodChange: jest.fn(),
  onSave: jest.fn(),
  remainingCents: 40000,
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useEarlyPaymentViewModel).mockReturnValue(viewModel);
  render(<EarlyPaymentModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, setup };
