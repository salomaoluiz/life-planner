import { fireEvent, screen } from "@tests";

import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";

import { defaultViewModel, setup } from "./mocks/index.mocks";
import { installmentEditTestIds, installmentPlanTestIds } from "./testIds";

it("SHOULD title the sheet with the installment number AND offer the three scopes", () => {
  setup();

  expect(
    screen.getByText(
      'financial.installment.label {"description":"Notebook","k":2,"n":3}',
    ),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${installmentEditTestIds.scope}-ONLY_THIS`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${installmentEditTestIds.scope}-THIS_AND_NEXT`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${installmentEditTestIds.scope}-ALL`),
  ).toBeOnTheScreen();
});

it("SHOULD change the scope WHEN another option is pressed", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(`${installmentEditTestIds.scope}-ALL`));

  expect(vm.onScopeChange).toHaveBeenCalledWith("ALL");
});

it("SHOULD save, open the plan and ask to delete", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(installmentEditTestIds.save));
  fireEvent.press(screen.getByTestId(installmentEditTestIds.seePlan));
  fireEvent.press(screen.getByTestId(installmentPlanTestIds.delete));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
  expect(vm.onPlanOpen).toHaveBeenCalledTimes(1);
  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD edit the text fields", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.getByTestId(installmentEditTestIds.description),
    "Laptop",
  );

  expect(vm.onDescriptionChange).toHaveBeenCalledWith("Laptop");
});

it("SHOULD show the total label AND the count WHEN editing All", () => {
  setup({
    fields: {
      amount: true,
      card: true,
      category: true,
      count: true,
      date: true,
      description: true,
    },
  });

  fireEvent.changeText(screen.getByTestId(installmentEditTestIds.count), "5");
});

it("SHOULD lock the amount with the paid helper WHEN the invoice is paid", () => {
  setup({
    fields: {
      amount: false,
      card: false,
      category: true,
      count: false,
      date: false,
      description: true,
    },
    isPaid: true,
  });

  expect(
    screen.getByTestId(installmentEditTestIds.paidHelper),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByText("financial.installmentEdit.paidHelper").length,
  ).toBeGreaterThan(0);
});

it("SHOULD show the plan sheet with the total AND one row per installment", () => {
  setup({ isPlanOpen: true });

  expect(screen.getByTestId(installmentPlanTestIds.total)).toBeOnTheScreen();
  expect(screen.getAllByTestId(installmentPlanTestIds.row)).toHaveLength(2);
});

it("SHOULD show the form error of a failed write", () => {
  setup({ formErrorKey: "financial.errors.installmentPaid" });

  expect(
    screen.getByTestId(installmentEditTestIds.formError),
  ).toBeOnTheScreen();
});

it("SHOULD show not found, with a way out", () => {
  const vm = setup({ isNotFound: true, plan: undefined, state: undefined });

  fireEvent.press(screen.getByText("common.actions.close"));

  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true, plan: undefined, state: undefined });

  expect(screen.getByTestId("installment-edit-skeleton")).toBeOnTheScreen();
});

it("SHOULD show the recalculation and delete confirmations", () => {
  const vm = setup({ isDeleteOpen: true, isRecalcOpen: true });

  expect(
    screen.getByText("financial.installmentEdit.recalcConfirm"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText('financial.installmentPlan.deleteConfirm {"n":3}'),
  ).toBeOnTheScreen();
  expect(vm.onRecalcConfirm).not.toHaveBeenCalled();
});

describe("prepayment (spec 032)", () => {
  function planWith(
    prepayment?: object,
    statuses: string[] = ["OPEN", "OPEN"],
  ) {
    const base = defaultViewModel.plan as InstallmentPlanDTO;

    return Object.assign(Object.create(Object.getPrototypeOf(base)), base, {
      installments: base.installments.map((row, index) => ({
        ...row,
        invoiceStatus: statuses[index],
        prepaid: !!prepayment && index === 1,
      })),
      prepayment,
    }) as InstallmentPlanDTO;
  }

  it("SHOULD offer Prepay installments in the plan sheet AND call onPrepayPress", () => {
    const vm = setup({ isPlanOpen: true, plan: planWith() });

    fireEvent.press(screen.getByTestId(installmentPlanTestIds.prepay));

    expect(vm.onPrepayPress).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId(installmentPlanTestIds.undoPrepayment),
    ).toBeNull();
  });

  it("SHOULD NOT offer it WHEN every installment is paid", () => {
    setup({ isPlanOpen: true, plan: planWith(undefined, ["PAID", "PAID"]) });

    expect(screen.queryByTestId(installmentPlanTestIds.prepay)).toBeNull();
  });

  it("SHOULD show where it was prepaid, the prepaid badge AND offer Undo prepayment", () => {
    const vm = setup({
      isPlanOpen: true,
      plan: planWith({
        date: "2026-10-16",
        discount: 12000,
        id: "p1",
        targetInvoiceMonth: "2026-10",
      }),
    });

    expect(
      screen.getByTestId(installmentPlanTestIds.prepayment),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId(installmentPlanTestIds.prepay)).toBeNull();
    expect(
      screen.getAllByText("financial.prepayment.prepaidBadge"),
    ).toHaveLength(1);
    fireEvent.press(screen.getByTestId(installmentPlanTestIds.undoPrepayment));

    expect(vm.onUndoPrepaymentPress).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show the undo confirmation", () => {
    setup({ isUndoPrepaymentOpen: true });

    expect(
      screen.getByText("financial.prepayment.undoConfirm"),
    ).toBeOnTheScreen();
  });
});

it("SHOULD refund the whole plan from its sheet", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(installmentEditTestIds.refund));

  expect(vm.onRefundPress).toHaveBeenCalledTimes(1);
});
