import { StyleSheet } from "react-native";

import { fireEvent, screen, within } from "@tests";

import { setup } from "./mocks/index.mocks";
import prepaymentTestIds from "./testIds";

it("SHOULD title the sheet with the plan AND offer the open and the closed invoice", () => {
  setup();

  expect(
    screen.getByText('financial.prepayment.title {"plan":"Notebook"}'),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${prepaymentTestIds.target}-2026-10`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${prepaymentTestIds.target}-2026-09`),
  ).toBeOnTheScreen();
});

it("SHOULD change the target invoice", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(`${prepaymentTestIds.target}-2026-09`));

  expect(vm.onTargetChange).toHaveBeenCalledWith("2026-09");
});

it("SHOULD show how many installments move, their total AND the resulting invoice", () => {
  setup();

  expect(
    screen.getByText(
      'financial.prepayment.summary {"count":7,"first":"4/10","last":"10/10"}',
    ),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(prepaymentTestIds.total)).toBeOnTheScreen();
  expect(screen.getByTestId(prepaymentTestIds.hint)).toBeOnTheScreen();
});

it("SHOULD show the discount field only WHEN the switch is on", () => {
  setup();
  expect(screen.queryByTestId(prepaymentTestIds.discount)).toBeNull();

  setup({ discountCents: 12000, hasDiscount: true });
  expect(screen.getByTestId(prepaymentTestIds.discount)).toBeOnTheScreen();
});

it("SHOULD toggle the discount AND edit its value", () => {
  const vm = setup({ hasDiscount: true });

  fireEvent(
    screen.getByTestId(prepaymentTestIds.hasDiscount),
    "valueChange",
    true,
  );
  fireEvent.changeText(screen.getByTestId(prepaymentTestIds.discount), "120");

  expect(vm.onHasDiscountChange).toHaveBeenCalledWith(true);
  expect(vm.onDiscountChange).toHaveBeenCalled();
});

it("SHOULD confirm the prepayment", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(prepaymentTestIds.confirm));

  expect(vm.onConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD show the discount error AND the form error", () => {
  setup({
    errors: { discount: "financial.prepayment.errors.discount" },
    formErrorKey: "financial.errors.invoicePaid",
    hasDiscount: true,
  });

  expect(screen.getByTestId(prepaymentTestIds.discount)).toBeOnTheScreen();
  expect(screen.getByTestId(prepaymentTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD say there is nothing to prepay AND disable the confirmation", () => {
  setup({ isEmpty: true, summary: undefined });

  expect(screen.getByTestId(prepaymentTestIds.empty)).toBeOnTheScreen();
});

it("SHOULD show a skeleton while loading AND an error WHEN there is no target invoice", () => {
  setup({ isLoading: true });
  expect(screen.getByTestId("prepayment-skeleton")).toBeOnTheScreen();
});

it("SHOULD offer closing WHEN no invoice can take the installments", () => {
  const vm = setup({ invoices: [], targetMonth: undefined });

  fireEvent.press(screen.getByText("common.actions.close"));

  expect(vm.onClose).toHaveBeenCalledTimes(1);
});

describe("wide layout (spec 037)", () => {
  const sheet = prepaymentTestIds.sheet;

  it("SHOULD be a form dialog with the fields split in two columns", () => {
    setup({}, "expanded");

    expect(
      StyleSheet.flatten(screen.getByTestId(sheet).props.style).maxWidth,
    ).toBe(880);
    const left = within(screen.getByTestId(`${sheet}-column-left`));
    const right = within(screen.getByTestId(`${sheet}-column-right`));
    expect(left.getByTestId(prepaymentTestIds.target)).toBeOnTheScreen();
    expect(right.getByTestId(prepaymentTestIds.hasDiscount)).toBeOnTheScreen();
    expect(right.getByTestId(prepaymentTestIds.date)).toBeOnTheScreen();
  });
});
