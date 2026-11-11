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

describe("corporate events (spec 108)", () => {
  const eventIds = investmentTestIds.modal.event;

  it("SHOULD offer the Evento segment WHEN the asset allows events AND pick it", () => {
    const { vm } = setup();

    fireEvent.press(screen.getByText("investment.operation.EVENT"));

    expect(vm.onTypeChange).toHaveBeenCalledWith("EVENT");
  });

  it("SHOULD hide the Evento segment WHEN events do not apply", () => {
    setup({ canPickEvent: false });

    expect(screen.queryByText("investment.operation.EVENT")).toBeNull();
  });

  it("SHOULD show the event form: bonus fields, the position before and after AND the fraction box", () => {
    const { form } = setup({ eventMode: true, type: "EVENT" as never });

    fireEvent.press(screen.getByTestId(eventIds.save));

    expect(screen.getByTestId(eventIds.bonusPercent)).toBeOnTheScreen();
    expect(screen.getByTestId(eventIds.bonusUnitCost)).toBeOnTheScreen();
    expect(screen.queryByTestId(eventIds.ratioFrom)).toBeNull();
    expect(screen.getByTestId(eventIds.preview)).toBeOnTheScreen();
    expect(hasText("R$ 3.325,44")).toBe(true);
    expect(screen.getByText(/investment.event.fractionInfo/)).toBeOnTheScreen();
    expect(hasText("investment.event.noFinanceEntry")).toBe(true);
    expect(hasText("investment.event.bonusUnitCostHint")).toBe(true);
    expect(form.onSave).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show the ratio fields AND the hint of a split", () => {
    setup(
      { eventMode: true },
      {
        fractionQuantity: "0",
        hasFraction: false,
        ratioFrom: "1",
        ratioTo: "4",
        type: "SPLIT" as never,
      },
    );

    expect(screen.getByTestId(eventIds.ratioFrom)).toBeOnTheScreen();
    expect(screen.getByTestId(eventIds.ratioTo)).toBeOnTheScreen();
    expect(screen.queryByTestId(eventIds.bonusPercent)).toBeNull();
    expect(screen.getByText(/investment.event.splitHint/)).toBeOnTheScreen();
    expect(screen.queryByText(/investment.event.fractionInfo/)).toBeNull();
  });

  it("SHOULD show Aprovar evento AND Recusar sugestão for a suggestion", () => {
    const { form } = setup(
      { eventMode: true },
      { isSuggestion: true, saveKey: "investment.event.approve" },
    );

    fireEvent.press(screen.getByTestId(eventIds.approve));
    fireEvent.press(screen.getByTestId(eventIds.rejectSuggestion));

    expect(form.onSave).toHaveBeenCalledTimes(1);
    expect(form.onReject).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId(eventIds.delete)).toBeNull();
  });

  it("SHOULD offer to delete an event WHEN editing AND list what goes with it", () => {
    const { form } = setup(
      { eventMode: true },
      {
        deleteBodyLines: [
          {
            key: "investment.event.deleteFraction",
            params: { date: "04/04/2026", quantity: "0,5", value: "R$ 5,20" },
          },
        ],
        deleteOpen: true,
        deleteType: "REVERSE_SPLIT" as never,
        isEditing: true,
      },
    );

    fireEvent.press(screen.getByTestId(eventIds.delete));

    expect(form.onDeleteOpen).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId(eventIds.deleteDialog)).toBeOnTheScreen();
    expect(
      screen.getByText(/investment.event.deleteFraction/),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the errors, the 422 AND no position", () => {
    setup(
      { eventMode: true },
      {
        errors: { bonusPercent: "investment.event.errors.percent" },
        failure: {
          key: "investment.event.fractionBreaks",
          params: { date: "x" },
        },
        noPosition: true,
        preview: null,
      },
    );

    expect(hasText("investment.event.errors.percent")).toBe(true);
    expect(
      screen.getByText(/investment.event.fractionBreaks/),
    ).toBeOnTheScreen();
    expect(screen.getByText(/investment.event.noPosition/)).toBeOnTheScreen();
    expect(screen.queryByTestId(eventIds.preview)).toBeNull();
  });

  it("SHOULD hide the actions WHEN read-only", () => {
    setup({ eventMode: true }, { readOnly: true });

    expect(screen.queryByTestId(eventIds.save)).toBeNull();
    expect(screen.queryByTestId(eventIds.delete)).toBeNull();
  });
});
