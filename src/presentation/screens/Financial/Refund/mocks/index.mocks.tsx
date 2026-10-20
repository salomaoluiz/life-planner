import { render } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import { RefundModal } from "../";
import { useRefundViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useRefundViewModel> = {
  amountCents: 50000,
  card: { id: "card-1", title: "Main card" } as never,
  carryCents: 0,
  carryMonth: "2026-11",
  currency: "BRL",
  date: new Date(2026, 9, 16),
  description: undefined,
  errors: {},
  formErrorKey: undefined,
  invoiceMonth: "2026-10",
  invoices: [
    {
      amountDueCents: 30000,
      month: "2026-10",
      status: "OPEN",
      totalCents: 30000,
    },
    { amountDueCents: 0, month: "2026-09", status: "CLOSED", totalCents: 0 },
  ],
  isDeleteOpen: false,
  isDeleting: false,
  isEdit: false,
  isLoading: false,
  isLocked: false,
  isSaving: false,
  linked: undefined,
  linkedIsPlan: false,
  linkedName: undefined,
  onAmountChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDescriptionChange: jest.fn(),
  onInvoiceChange: jest.fn(),
  onSave: jest.fn(),
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useRefundViewModel).mockReturnValue(viewModel);
  render(<RefundModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, setup };
