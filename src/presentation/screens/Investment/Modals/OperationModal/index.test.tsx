import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import {
  InvestmentFeeKind,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { previewOf, setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.operation;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the fields, the summary AND the new average of a buy", () => {
  const { vm } = setup({
    preview: previewOf(InvestmentOperationType.BUY, "100"),
    quantity: "100",
    unitPrice: "10.9",
  });

  expect(screen.getByTestId(ids.quantity)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.unitPrice)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.preview)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.summaryTotal)).toBeOnTheScreen();
  expect(
    hasText('investment.form.operation.newAverage {"value":"R$10.25"}'),
  ).toBe(false);
  expect(hasText("investment.form.operation.totalPaid")).toBe(true);

  fireEvent.changeText(screen.getByTestId(ids.quantity), "50");
  fireEvent.changeText(screen.getByTestId(ids.unitPrice), "11");
  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onQuantityChange).toHaveBeenCalledWith("50");
  expect(vm.onUnitPriceChange).toHaveBeenCalledWith("11");
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD show the realized result AND the available quantity of a sell", () => {
  setup({
    availableQuantity: "1500",
    preview: previewOf(InvestmentOperationType.SELL, "100"),
    quantity: "100",
    saveLabelKey: "investment.form.operation.saveSell",
    type: InvestmentOperationType.SELL,
    unitPrice: "10.9",
  });

  expect(screen.getByTestId(ids.available)).toBeOnTheScreen();
  expect(hasText("investment.form.operation.realizedPreview")).toBe(true);
  expect(hasText("investment.form.operation.totalReceived")).toBe(true);
});

it("SHOULD show the insufficient quantity error AND disable save", () => {
  setup({
    availableQuantity: "1500",
    insufficient: true,
    preview: previewOf(InvestmentOperationType.SELL, "9000"),
    quantity: "9000",
    type: InvestmentOperationType.SELL,
    unitPrice: "10.9",
  });

  expect(JSON.stringify(screen.toJSON())).toContain(
    "investment.form.operation.insufficient",
  );
  expect(screen.getByTestId(ids.save).props.accessibilityState?.disabled).toBe(
    true,
  );
});

it("SHOULD manage the fee rows", () => {
  const { vm } = setup({
    feeErrors: { f1: "investment.form.operation.feeDescriptionRequired" },
    feeKinds: Object.values(InvestmentFeeKind),
    fees: [
      {
        amountCents: 490,
        description: "",
        key: "f1",
        kind: InvestmentFeeKind.OTHER,
      },
    ],
  });

  fireEvent.press(screen.getByTestId(ids.addFee));
  fireEvent.press(screen.getByTestId(ids.feeRemove(0)));
  fireEvent.changeText(screen.getByTestId(ids.feeDescription(0)), "Custody");

  expect(vm.onAddFee).toHaveBeenCalledTimes(1);
  expect(vm.onFeeRemove).toHaveBeenCalledWith("f1");
  expect(vm.onFeeDescriptionChange).toHaveBeenCalledWith("f1", "Custody");
  expect(hasText("investment.form.operation.feeDescriptionRequired")).toBe(
    true,
  );
});

it("SHOULD hide the account WHEN the finance entry is off", () => {
  setup({ generate: false });

  expect(screen.queryByTestId(ids.account)).toBeNull();
});

it("SHOULD show the delete action WHEN editing AND confirm it", () => {
  const { vm } = setup({ deleteOpen: true, isEditing: true });

  fireEvent.press(screen.getByTestId(ids.delete));
  fireEvent.press(screen.getAllByText("investment.asset.delete").slice(-1)[0]);

  expect(vm.onDeleteOpen).toHaveBeenCalledTimes(1);
  expect(vm.onDeleteConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD be read-only WHEN the account cannot be changed", () => {
  setup({
    isEditing: true,
    readOnly: true,
    readOnlyKey: "investment.form.operation.readOnlyAccount",
  });

  expect(hasText("investment.form.operation.readOnlyAccount")).toBe(true);
  expect(screen.queryByTestId(ids.save)).toBeNull();
  expect(screen.queryByTestId(ids.delete)).toBeNull();
  expect(screen.queryByTestId(ids.addFee)).toBeNull();
});

it("SHOULD show the failure, the loading AND the not found states", () => {
  setup({
    failure: {
      key: "investment.errors.negativePosition",
      params: { date: "x" },
    },
  });
  expect(JSON.stringify(screen.toJSON())).toContain(
    "investment.errors.negativePosition",
  );

  setup({ isLoading: true });
  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});

it("SHOULD show the discard dialog", () => {
  const { vm } = setup({ discardOpen: true });

  fireEvent.press(screen.getByText("common.form.discard"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
});
