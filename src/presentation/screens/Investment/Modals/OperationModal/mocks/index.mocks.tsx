import { render } from "@tests";

import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { previewOperation } from "@domain/entities/investment/position";
import { makeAsset, makeDetail } from "@screens/Investment/mocks/fixtures";

import OperationModal from "../";
import { OperationModalVM, useOperationModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: OperationModalVM = {
  accountError: undefined,
  accountId: "acc-1",
  accountOptions: [{ label: "Broker · BRL", value: "acc-1" }],
  asset: makeDetail(makeAsset()),
  availableQuantity: undefined,
  currency: "BRL",
  date: new Date(2026, 5, 10),
  deleteOpen: false,
  discardOpen: false,
  failure: undefined,
  feeErrors: {},
  feeKinds: [],
  fees: [],
  fxRate: "",
  fxRateError: undefined,
  fxRatePlaceholder: "",
  generate: true,
  insufficient: false,
  isDeleting: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onAccountChange: jest.fn(),
  onAddFee: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeleteOpen: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onFeeAmountChange: jest.fn(),
  onFeeDescriptionChange: jest.fn(),
  onFeeKindChange: jest.fn(),
  onFeeRemove: jest.fn(),
  onFxRateChange: jest.fn(),
  onGenerateChange: jest.fn(),
  onQuantityChange: jest.fn(),
  onSave: jest.fn(),
  onTypeChange: jest.fn(),
  onUnitPriceChange: jest.fn(),
  preview: undefined,
  quantity: "",
  quantityError: undefined,
  readOnly: false,
  readOnlyKey: undefined,
  saveLabelKey: "investment.form.operation.saveBuy",
  showFxRate: false,
  titleKey: "investment.form.operation.newTitle",
  type: InvestmentOperationType.BUY,
  unitPrice: "",
  unitPriceError: undefined,
};

function previewOf(type: InvestmentOperationType, quantity: string) {
  return previewOperation(makeDetail().operations.slice(1), {
    date: "2026-11-01",
    fees: [550],
    quantity,
    type,
    unitPrice: "10.9",
  });
}

function setup(overrides: Partial<OperationModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useOperationModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<OperationModal />) };
}

export { defaultViewModel, previewOf, setup };
