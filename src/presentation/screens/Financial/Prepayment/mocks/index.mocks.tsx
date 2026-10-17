import { render } from "@tests";

import { PrepaymentModal } from "../";
import { usePrepaymentViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof usePrepaymentViewModel> = {
  date: new Date(2026, 9, 16),
  discountCents: 0,
  errors: {},
  formErrorKey: undefined,
  hasDiscount: false,
  invoices: [
    { amountDueCents: 0, month: "2026-10", status: "OPEN", totalCents: 0 },
    {
      amountDueCents: 100000,
      month: "2026-09",
      status: "CLOSED",
      totalCents: 100000,
    },
  ],
  isEmpty: false,
  isLoading: false,
  isPreviewing: false,
  isSaving: false,
  movedCents: 358400,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onDateChange: jest.fn(),
  onDiscountChange: jest.fn(),
  onHasDiscountChange: jest.fn(),
  onTargetChange: jest.fn(),
  planDescription: "Notebook",
  resultingTotalCents: 346400,
  summary: { count: 7, first: "4/10", last: "10/10" },
  targetMonth: "2026-10",
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(usePrepaymentViewModel).mockReturnValue(viewModel);
  render(<PrepaymentModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, setup };
