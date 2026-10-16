import { act } from "@tests";

import { InstallmentPaid } from "@domain/entities/errors";

import {
  givenLoaded,
  makePlan,
  mutations,
  queries,
  setup,
  spies,
} from "./useInstallmentEditViewModel.mocks";

describe("loading", () => {
  it("SHOULD be loading until the transaction and its plan arrive", () => {
    queries.getOwnersUseCase.withData([]);

    expect(setup().result.current.isLoading).toBe(true);
  });

  it("SHOULD report not found WHEN the transaction is gone", () => {
    givenLoaded({ rows: [] });

    const { result } = setup();

    expect(result.current.isNotFound).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("SHOULD start on Only this one with the row value AND offer the owner's active expense categories and cards", () => {
    givenLoaded();

    const { result } = setup();

    expect(result.current.state).toEqual(
      expect.objectContaining({ amountCents: 3333, scope: "ONLY_THIS" }),
    );
    expect(result.current.installmentNumber).toBe(2);
    expect(result.current.installmentCount).toBe(3);
    expect(result.current.categoryOptions.map((o) => o.value)).toEqual([
      "cat-1",
      "cat-2",
    ]);
    expect(result.current.cardOptions.map((o) => o.value)).toEqual([
      "card-1",
      "card-2",
    ]);
    expect(result.current.fields).toEqual(
      expect.objectContaining({ amount: true, card: false, count: false }),
    );
  });
});

describe("scope", () => {
  it("SHOULD open every field AND show the plan TOTAL on All", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("ALL"));

    expect(result.current.state?.amountCents).toBe(10000);
    expect(Object.values(result.current.fields).every(Boolean)).toBe(true);
  });

  it("SHOULD lock everything but description and category WHEN the invoice is paid", () => {
    givenLoaded({ plan: makePlan(["PAID", "PAID", "OPEN"]) });
    const { result } = setup();

    expect(result.current.isPaid).toBe(true);
    act(() => result.current.onScopeChange("ALL"));
    expect(result.current.fields).toEqual({
      amount: false,
      card: false,
      category: true,
      count: false,
      date: false,
      description: true,
    });
  });
});

describe("save", () => {
  it("SHOULD update only this row with its scope (Only this one)", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onAmountChange(1500));
    act(() => result.current.onSave());

    expect(
      mutations.updateFinancialTransactionUseCase.value.mutate,
    ).toHaveBeenCalledWith({
      categoryId: undefined,
      description: undefined,
      id: "row-2",
      scope: "ONLY_THIS",
      value: "15.00",
    });
  });

  it("SHOULD update from this row on with This and the next ones", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("THIS_AND_NEXT"));
    act(() => result.current.onAmountChange(2000));
    act(() => result.current.onSave());

    expect(
      mutations.updateFinancialTransactionUseCase.value.mutate,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "THIS_AND_NEXT", value: "20.00" }),
    );
  });

  it("SHOULD rename through the plan WITHOUT confirmation WHEN All only changes text", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("ALL"));
    act(() => result.current.onDescriptionChange("Laptop"));
    act(() => result.current.onSave());

    expect(result.current.isRecalcOpen).toBe(false);
    expect(
      mutations.updateFinancialInstallmentPlanUseCase.value.mutate,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Laptop",
        id: "plan-1",
        installments: undefined,
        value: undefined,
      }),
    );
  });

  it("SHOULD ask for confirmation BEFORE recalculating AND save after the confirmation", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("ALL"));
    act(() => result.current.onCountChange("5"));
    act(() => result.current.onSave());

    expect(result.current.isRecalcOpen).toBe(true);
    expect(
      mutations.updateFinancialInstallmentPlanUseCase.value.mutate,
    ).not.toHaveBeenCalled();

    act(() => result.current.onRecalcConfirm());

    expect(result.current.isRecalcOpen).toBe(false);
    expect(
      mutations.updateFinancialInstallmentPlanUseCase.value.mutate,
    ).toHaveBeenCalledWith(expect.objectContaining({ installments: 5 }));
  });

  it("SHOULD keep the plan untouched WHEN the confirmation is cancelled", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("ALL"));
    act(() => result.current.onAmountChange(12000));
    act(() => result.current.onSave());
    act(() => result.current.onRecalcCancel());

    expect(result.current.isRecalcOpen).toBe(false);
    expect(
      mutations.updateFinancialInstallmentPlanUseCase.value.mutate,
    ).not.toHaveBeenCalled();
  });

  it("SHOULD NOT save an invalid form AND show the errors", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onDescriptionChange("   "));
    act(() => result.current.onSave());

    expect(result.current.errors.description).toBe(
      "financial.transactions.form.errors.descriptionRequired",
    );
    expect(
      mutations.updateFinancialTransactionUseCase.value.mutate,
    ).not.toHaveBeenCalled();
  });

  it("SHOULD change the other editable fields", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onScopeChange("ALL"));
    act(() => result.current.onCategoryChange("cat-2"));
    act(() => result.current.onCardChange("card-2"));
    act(() => result.current.onDateChange(new Date(2026, 10, 2, 15)));

    expect(result.current.state).toEqual(
      expect.objectContaining({
        categoryId: "cat-2",
        creditCardId: "card-2",
        date: new Date(2026, 10, 2),
      }),
    );
  });
});

describe("plan sheet and delete", () => {
  it("SHOULD open and close the plan sheet", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onPlanOpen());
    expect(result.current.isPlanOpen).toBe(true);
    act(() => result.current.onPlanClose());
    expect(result.current.isPlanOpen).toBe(false);
  });

  it("SHOULD delete the WHOLE plan after the confirmation", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onDeletePress());
    expect(result.current.isDeleteOpen).toBe(true);
    act(() => result.current.onDeleteConfirm());

    expect(
      mutations.deleteFinancialInstallmentPlanUseCase.value.mutate,
    ).toHaveBeenCalledWith("plan-1");
    expect(result.current.isDeleteOpen).toBe(false);
  });

  it("SHOULD close the delete dialog on cancel", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onDeletePress());
    act(() => result.current.onDeleteCancel());

    expect(result.current.isDeleteOpen).toBe(false);
  });
});

describe("after a write", () => {
  it("SHOULD refresh the lists AND close WHEN a write succeeded", () => {
    givenLoaded();
    mutations.updateFinancialInstallmentPlanUseCase.value.status = "success";

    setup();

    expect(spies.back).toHaveBeenCalledTimes(1);
    expect(spies.invalidate).toHaveBeenCalled();
  });

  it("SHOULD expose the form error of a failed write", () => {
    givenLoaded();
    expect(setup().result.current.formErrorKey).toBeUndefined();

    mutations.updateFinancialInstallmentPlanUseCase.value.error =
      new InstallmentPaid();

    expect(setup().result.current.formErrorKey).toBe(
      "financial.errors.installmentPaid",
    );
  });

  it("SHOULD close", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onClose());

    expect(spies.back).toHaveBeenCalled();
  });
});

describe("prepayment (spec 032)", () => {
  it("SHOULD open the prepayment sheet of the plan", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onPrepayPress());

    expect(spies.replace).toHaveBeenCalledWith({
      params: { planId: "plan-1" },
      pathname: "/financial/prepayment/prepay_installments",
    });
  });

  it("SHOULD undo the prepayment after the confirmation", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onUndoPrepaymentPress());
    expect(result.current.isUndoPrepaymentOpen).toBe(true);
    act(() => result.current.onUndoPrepaymentConfirm());

    expect(
      mutations.undoFinancialPrepaymentUseCase.value.mutate,
    ).toHaveBeenCalledWith("plan-1");
    act(() => result.current.onUndoPrepaymentCancel());
    expect(result.current.isUndoPrepaymentOpen).toBe(false);
  });

  it("SHOULD refresh the plan AND close the dialog WHEN the undo succeeds", () => {
    givenLoaded();
    mutations.undoFinancialPrepaymentUseCase.withStatus("success");

    setup();

    expect(
      queries.getFinancialInstallmentPlanUseCase.value.refetch,
    ).toHaveBeenCalled();
    expect(spies.invalidate).toHaveBeenCalled();
  });
});

it("SHOULD open the refund sheet linked to the plan (spec 032)", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onRefundPress());

  expect(spies.replace).toHaveBeenCalledWith({
    params: { creditCardId: "card-1", refundedPlanId: "plan-1" },
    pathname: "/financial/refund/card_refund",
  });
});
