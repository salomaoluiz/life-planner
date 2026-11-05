import { render } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { useBreakpoint } from "@presentation/theme";

import { ConfirmPaymentModal } from "../";
import { useConfirmPaymentViewModel } from "../hooks";

jest.mock("../hooks");

const item = new TransactionDTO({
  accountName: "Conta corrente",
  category: "Home",
  categoryId: "category-id",
  date: new Date(2026, 9, 28).toISOString(),
  description: "Conta de luz",
  id: "tx-1",
  owner: "USER",
  ownerId: "owner-id",
  paid: false,
  type: "EXPENSE",
  value: "184.20",
});

const defaultViewModel: ReturnType<typeof useConfirmPaymentViewModel> = {
  amountError: undefined,
  cents: 19175,
  choice: "transaction",
  choices: ["transaction", "today", "yesterday", "other"],
  differenceCents: 755,
  isIncome: false,
  isReady: true,
  isValid: true,
  item,
  onCentsChange: jest.fn(),
  onChoice: jest.fn(),
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onOtherDate: jest.fn(),
  originalCents: 18420,
  otherDate: undefined,
  overdueDays: 7,
  transactionDate: new Date(2026, 9, 28),
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };

  jest.mocked(useConfirmPaymentViewModel).mockReturnValue(viewModel);
  render(<ConfirmPaymentModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, item, setup };
