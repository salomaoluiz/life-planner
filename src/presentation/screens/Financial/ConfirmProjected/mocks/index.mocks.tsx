import { render } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import { ConfirmProjectedModal } from "../";
import { useConfirmProjectedViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useConfirmProjectedViewModel> = {
  amountCents: 9990,
  amountError: undefined,
  card: { id: "card-1", title: "Main card" } as never,
  currency: "BRL",
  date: new Date(2026, 9, 24),
  description: "Youtube Premium",
  differenceCents: -10,
  formErrorKey: undefined,
  invoiceMonth: "2026-11",
  isLoading: false,
  isRecurring: true,
  isSaving: false,
  onAmountChange: jest.fn(),
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onDateChange: jest.fn(),
  projectedCents: 10000,
  projectedDate: new Date(2026, 9, 25),
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useConfirmProjectedViewModel).mockReturnValue(viewModel);
  render(<ConfirmProjectedModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, setup };
