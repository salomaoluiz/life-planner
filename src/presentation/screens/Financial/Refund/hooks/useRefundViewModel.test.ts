import { act } from "@tests";

import {
  givenLoaded,
  mutations,
  setup,
  spies,
} from "./mocks/useRefundViewModel.mocks";

function create() {
  return mutations.createFinancialRefundUseCase.value.mutate;
}
function remove() {
  return mutations.deleteFinancialRefundUseCase.value.mutate;
}
function update() {
  return mutations.updateFinancialRefundUseCase.value.mutate;
}

it("SHOULD stay loading until the cards arrive", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD default the invoice by the date (16/10 with closing day 10 = November, the open one)", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.invoices.map((invoice) => invoice.month)).toEqual([
    "2026-11",
    "2026-10",
  ]);
  expect(result.current.invoiceMonth).toBe("2026-11");

  act(() => result.current.onDateChange(new Date(2026, 9, 5)));
  expect(result.current.invoiceMonth).toBe("2026-10");

  act(() => result.current.onInvoiceChange("2026-11"));
  expect(result.current.invoiceMonth).toBe("2026-11");
});

it("SHOULD offer the purchases AND plans of the card as the link", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.linkedOptions.map((option) => option.value)).toEqual(
    expect.arrayContaining(["tx:t1", "tx:t2", "plan:plan-1"]),
  );

  act(() => result.current.onLinkedChange("tx:t2"));
  expect(result.current.linkedName).toBe("TV");
  act(() => result.current.onLinkedClear());
  expect(result.current.linked).toBeUndefined();
});

it("SHOULD create the refund with the link, the date and the default description", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onLinkedChange("tx:t1"));
  act(() => result.current.onAmountChange(50000));
  act(() => result.current.onSave("Refund · Notebook"));

  expect(create()).toHaveBeenCalledWith({
    creditCardId: "card-1",
    date: "2026-10-16",
    description: "Refund · Notebook",
    invoiceMonth: "2026-11",
    refundedPlanId: undefined,
    refundedTransactionId: "t1",
    value: 50000,
  });
});

it("SHOULD keep what the user typed instead of the default description", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onDescriptionChange("Chargeback"));
  act(() => result.current.onAmountChange(100));
  act(() => result.current.onSave("Refund"));

  expect(create()).toHaveBeenCalledWith(
    expect.objectContaining({ description: "Chargeback" }),
  );
});

it("SHOULD NOT save without a value AND show the errors", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onSave("Refund"));

  expect(create()).not.toHaveBeenCalled();
  expect(result.current.errors.amount).toBe("financial.refund.errors.amount");
});

it("SHOULD announce the credit carried to the next invoice (500 on a 300 invoice = 200 to December)", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onInvoiceChange("2026-10"));
  act(() => result.current.onAmountChange(50000));

  expect(result.current.carryCents).toBe(20000);
  expect(result.current.carryMonth).toBe("2026-11");
});

describe("editing a refund", () => {
  beforeEach(() => {
    spies.params.mockReturnValue({
      creditCardId: "card-1",
      date: "2026-10-05",
      description: "Chargeback",
      id: "refund-1",
      invoiceMonth: "2026-10",
      refundedTransactionId: "t1",
      value: "20000",
    });
  });

  it("SHOULD start from the stored refund AND send every field (null removes the link)", () => {
    givenLoaded();
    const { result } = setup();

    expect(result.current.isEdit).toBe(true);
    expect(result.current.amountCents).toBe(20000);
    expect(result.current.description).toBe("Chargeback");
    expect(result.current.linked).toBe("tx:t1");

    act(() => result.current.onLinkedClear());
    act(() => result.current.onSave("Refund"));

    expect(update()).toHaveBeenCalledWith({
      creditCardId: "card-1",
      date: "2026-10-05",
      description: "Chargeback",
      id: "refund-1",
      invoiceMonth: "2026-10",
      refundedPlanId: null,
      refundedTransactionId: null,
      value: 20000,
    });
  });

  it("SHOULD not count the refund being edited twice in the carry hint", () => {
    givenLoaded();
    const { result } = setup();

    // October total is 300 INCLUDING this 200 refund: raising it to 500 leaves a credit of 200 only after the original 200.
    act(() => result.current.onAmountChange(60000));

    expect(result.current.carryCents).toBe(10000);
  });

  it("SHOULD change only the description WHEN the invoice is paid", () => {
    spies.params.mockReturnValue({
      creditCardId: "card-1",
      description: "Chargeback",
      id: "refund-1",
      invoiceMonth: "2026-08",
      value: "20000",
    });
    givenLoaded();
    const { result } = setup();

    expect(result.current.isLocked).toBe(true);
    act(() => result.current.onDescriptionChange("Renamed"));
    act(() => result.current.onSave("Refund"));

    expect(update()).toHaveBeenCalledWith({
      creditCardId: "card-1",
      description: "Renamed",
      id: "refund-1",
    });
  });

  it("SHOULD delete after the confirmation", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onDeletePress());
    expect(result.current.isDeleteOpen).toBe(true);
    act(() => result.current.onDeleteConfirm());

    expect(remove()).toHaveBeenCalledWith({
      creditCardId: "card-1",
      id: "refund-1",
    });
    expect(result.current.isDeleteOpen).toBe(false);

    act(() => result.current.onDeleteCancel());
  });
});

it("SHOULD refresh everything AND close WHEN a refund is saved", () => {
  givenLoaded();
  mutations.createFinancialRefundUseCase.withStatus("success");

  setup();

  expect(spies.invalidate).toHaveBeenCalledWith(["getMonthSummaryUseCase"]);
  expect(spies.back).toHaveBeenCalled();
});

it("SHOULD map a save error to its copy key AND close on demand", () => {
  givenLoaded();
  mutations.createFinancialRefundUseCase.withError();
  const { result } = setup();

  expect(result.current.formErrorKey).toBe("common.errors.generic");
  act(() => result.current.onClose());
  expect(spies.back).toHaveBeenCalled();
});
