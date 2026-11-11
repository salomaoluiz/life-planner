import { render } from "@tests";

import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { previewOperation } from "@domain/entities/investment/position";
import { makeAsset, makeDetail } from "@screens/Investment/mocks/fixtures";

import OperationModal from "../";
import {
  EventFormVM,
  OperationModalVM,
  useEventFormViewModel,
  useOperationModalViewModel,
} from "../hooks";

jest.mock("../hooks");

const defaultViewModel: OperationModalVM = {
  accountError: undefined,
  accountId: "acc-1",
  accountOptions: [{ label: "Broker · BRL", value: "acc-1" }],
  asset: makeDetail(makeAsset()),
  availableQuantity: undefined,
  canPickEvent: true,
  currency: "BRL",
  date: new Date(2026, 5, 10),
  deleteOpen: false,
  discardOpen: false,
  eventMode: false,
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
  operation: undefined,
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

const defaultEventForm: EventFormVM = {
  bonusEvery: "10",
  bonusPercent: "10",
  bonusUnitCost: "4.5",
  date: new Date(2026, 10, 18),
  deleteBodyLines: [],
  deleteDate: "10/03/2026",
  deleteOpen: false,
  deleteType: undefined,
  discardOpen: false,
  errors: {},
  eventTypes: [
    InvestmentOperationType.SPLIT,
    InvestmentOperationType.REVERSE_SPLIT,
    InvestmentOperationType.BONUS,
  ],
  failure: undefined,
  fractionQuantity: "0,5",
  hasFraction: true,
  isDeleting: false,
  isEditing: false,
  isLoading: false,
  isSaving: false,
  isSuggestion: false,
  newShares: "31",
  noPosition: false,
  noPositionDate: "18/11/2026",
  onBonusPercentChange: jest.fn(),
  onBonusUnitCostChange: jest.fn(),
  onClose: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeleteOpen: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onRatioFromChange: jest.fn(),
  onRatioToChange: jest.fn(),
  onReject: jest.fn(),
  onSave: jest.fn(),
  onTypeChange: jest.fn(),
  preview: {
    averagePrice: { after: "R$ 9,61", before: "R$ 10,11" },
    cost: { after: "R$ 3.325,44", before: "R$ 3.185,94" },
    quantity: { after: "346", before: "315" },
  },
  ratioFrom: "",
  ratioTo: "",
  readOnly: false,
  saveKey: "investment.event.save",
  ticker: "MGLU3",
  titleKey: "investment.form.operation.newTitle",
  type: InvestmentOperationType.BONUS,
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

function setup(
  overrides: Partial<OperationModalVM> = {},
  eventOverrides: Partial<EventFormVM> = {},
) {
  const vm = { ...defaultViewModel, ...overrides };
  const form = { ...defaultEventForm, ...eventOverrides };
  jest.mocked(useOperationModalViewModel).mockReturnValue(vm);
  jest.mocked(useEventFormViewModel).mockReturnValue(form);

  return { form, vm, ...render(<OperationModal />) };
}

export { defaultEventForm, defaultViewModel, previewOf, setup };
