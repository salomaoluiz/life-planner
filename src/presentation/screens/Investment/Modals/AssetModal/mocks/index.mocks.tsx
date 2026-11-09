import { render } from "@tests";

import { InvestmentAssetClass } from "@domain/entities/investment/enums";

import AssetModal from "../";
import { AssetModalVM, useAssetModalViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: AssetModalVM = {
  assetClass: InvestmentAssetClass.BR_STOCK,
  classLocked: false,
  classOptions: [
    {
      labelKey: "investment.class.BR_STOCK",
      value: InvestmentAssetClass.BR_STOCK,
    },
  ],
  currency: "BRL",
  currencyOptions: ["BRL", "USD"],
  currentValue: "",
  currentValueError: undefined,
  discardOpen: false,
  failure: undefined,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  name: "",
  nameError: undefined,
  onAssetClassChange: jest.fn(),
  onClose: jest.fn(),
  onCurrencyChange: jest.fn(),
  onCurrentValueChange: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onNameChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onSave: jest.fn(),
  onTickerChange: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.personal", value: "user-1" }],
  ownerId: "user-1",
  ticker: "",
  tickerError: undefined,
  tickerRequired: true,
  titleKey: "investment.form.asset.newTitle",
};

function setup(overrides: Partial<AssetModalVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useAssetModalViewModel).mockReturnValue(vm);

  return { vm, ...render(<AssetModal />) };
}

export { defaultViewModel, setup };
