import { render } from "@tests";

import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import { useBreakpoint } from "@presentation/theme";

import { InstallmentEditModal } from "../";
import { useInstallmentEditViewModel } from "../hooks";
import { initialState } from "../models/installmentEditState";

jest.mock("../hooks");

const plan = new InstallmentPlanDTO({
  categoryId: "cat-1",
  creditCardId: "card-1",
  date: new Date(2026, 9, 20).toISOString(),
  description: "Notebook",
  id: "plan-1",
  installmentCount: 3,
  installments: [
    {
      id: "row-1",
      installmentNumber: 1,
      invoiceMonth: "2026-10",
      invoiceStatus: "PAID",
      value: "33.34",
    },
    {
      id: "row-2",
      installmentNumber: 2,
      invoiceMonth: "2026-11",
      invoiceStatus: "OPEN",
      value: "33.33",
    },
  ],
  owner: "USER",
  ownerId: "user-id",
  totalValue: "66.67",
});

const defaultViewModel: ReturnType<typeof useInstallmentEditViewModel> = {
  cardOptions: [{ label: "Main ••1234", value: "card-1" }],
  categoryOptions: [{ label: "Tech", value: "cat-1" }],
  currency: "BRL",
  errors: {},
  fields: {
    amount: true,
    card: false,
    category: true,
    count: false,
    date: false,
    description: true,
  },
  formErrorKey: undefined,
  installmentCount: 3,
  installmentNumber: 2,
  isDeleteOpen: false,
  isDeleting: false,
  isLoading: false,
  isNotFound: false,
  isPaid: false,
  isPlanOpen: false,
  isRecalcOpen: false,
  isSaving: false,
  isUndoingPrepayment: false,
  isUndoPrepaymentOpen: false,
  onAmountChange: jest.fn(),
  onCardChange: jest.fn(),
  onCategoryChange: jest.fn(),
  onClose: jest.fn(),
  onCountChange: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDescriptionChange: jest.fn(),
  onPlanClose: jest.fn(),
  onPlanOpen: jest.fn(),
  onPrepayPress: jest.fn(),
  onRecalcCancel: jest.fn(),
  onRecalcConfirm: jest.fn(),
  onRefundPress: jest.fn(),
  onSave: jest.fn(),
  onScopeChange: jest.fn(),
  onUndoPrepaymentCancel: jest.fn(),
  onUndoPrepaymentConfirm: jest.fn(),
  onUndoPrepaymentPress: jest.fn(),
  plan,
  state: initialState(plan, {
    categoryId: "cat-1",
    description: "Notebook",
    value: "33.33",
  } as never),
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useInstallmentEditViewModel).mockReturnValue(viewModel);
  render(<InstallmentEditModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, plan, setup };
