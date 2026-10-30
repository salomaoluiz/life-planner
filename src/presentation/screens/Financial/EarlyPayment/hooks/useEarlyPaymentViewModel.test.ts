import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import {
  givenLoaded,
  mutations,
  setup,
  spies,
} from "./mocks/useEarlyPaymentViewModel.mocks";

function create() {
  return mutations.createFinancialEarlyPaymentUseCase.value.mutate;
}
function remove() {
  return mutations.deleteFinancialEarlyPaymentUseCase.value.mutate;
}
function update() {
  return mutations.updateFinancialEarlyPaymentUseCase.value.mutate;
}

it("SHOULD stay loading until the cards arrive", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD offer only invoices with something to pay AND prefill the amount due", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.invoices.map((invoice) => invoice.month)).toEqual([
    "2026-10",
  ]);
  expect(result.current.invoiceMonth).toBe("2026-10");
  expect(result.current.leftCents).toBe(100000);
  expect(result.current.amountCents).toBe(100000);
  expect(result.current.method).toBe("ACCOUNT");
  expect(result.current.date).toEqual(new Date(2026, 9, 16));
});

it("SHOULD offer only ACTIVE accounts AND show what is left after the value (1.000 - 600 = 400)", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.accountOptions).toEqual([{ label: "a1", value: "a1" }]);
  act(() => result.current.onAmountChange(60000));
  expect(result.current.remainingCents).toBe(40000);
});

it("SHOULD create an early payment from an account", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onAmountChange(60000));
  act(() => result.current.onAccountChange("a1"));
  act(() => result.current.onSave("Early payment"));

  expect(create()).toHaveBeenCalledWith({
    accountId: "a1",
    creditCardId: "card-1",
    date: "2026-10-16",
    description: "Early payment",
    invoiceMonth: "2026-10",
    method: "ACCOUNT",
    value: 60000,
  });
});

it("SHOULD create a boleto payment WITHOUT account AND keep the typed description and date", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onMethodChange("EXTERNAL"));
  act(() => result.current.onAccountChange("a1"));
  act(() => result.current.onDescriptionChange("Boleto 1"));
  act(() => result.current.onDateChange(new Date(2026, 9, 3)));
  act(() => result.current.onDateChange(undefined));
  act(() => result.current.onSave("Early payment"));

  expect(create()).toHaveBeenCalledWith({
    accountId: undefined,
    creditCardId: "card-1",
    date: "2026-10-03",
    description: "Boleto 1",
    invoiceMonth: "2026-10",
    method: "EXTERNAL",
    value: 100000,
  });
});

it("SHOULD refuse a value above what is left, an unchosen account AND a date after today", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onAmountChange(100001));
  act(() => result.current.onSave("Early payment"));

  expect(create()).not.toHaveBeenCalled();
  expect(result.current.errors.amount).toBe("financial.errors.overAmountDue");
  expect(result.current.errors.account).toBe(
    "financial.earlyPayment.errors.account",
  );

  act(() => result.current.onDateChange(new Date(2026, 9, 17)));
  expect(result.current.errors.date).toBe("financial.earlyPayment.errors.date");
});

it("SHOULD follow the amount due of another invoice until a value is typed", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onInvoiceChange("2026-10"));

  expect(result.current.amountCents).toBe(100000);
});

describe("editing an early payment", () => {
  beforeEach(() => {
    spies.params.mockReturnValue({
      creditCardId: "card-1",
      id: "early-1",
      invoiceMonth: "2026-10",
    });
  });

  it("SHOULD wait for the stored payment AND then start from it (cap = due + own value)", () => {
    givenLoaded();
    expect(setup().result.current.isLoading).toBe(true);

    givenLoaded(true);
    const { result } = setup();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEdit).toBe(true);
    expect(result.current.amountCents).toBe(60000);
    expect(result.current.description).toBe("Early payment");
    expect(result.current.accountId).toBe("a1");
    expect(result.current.leftCents).toBe(160000);
  });

  it("SHOULD send every field WHEN saved", () => {
    givenLoaded(true);
    const { result } = setup();

    act(() => result.current.onAmountChange(50000));
    act(() => result.current.onSave("Early payment"));

    expect(update()).toHaveBeenCalledWith({
      accountId: "a1",
      creditCardId: "card-1",
      date: "2026-10-16",
      description: "Early payment",
      id: "early-1",
      invoiceMonth: "2026-10",
      method: "ACCOUNT",
      value: 50000,
    });
  });

  it("SHOULD send only the description WHEN the invoice is paid", () => {
    spies.params.mockReturnValue({
      creditCardId: "card-1",
      id: "early-1",
      invoiceMonth: "2026-08",
    });
    givenLoaded(true);
    const { result } = setup();

    expect(result.current.isLocked).toBe(true);
    act(() => result.current.onDescriptionChange("Renamed"));
    act(() => result.current.onSave("Early payment"));

    expect(update()).toHaveBeenCalledWith({
      creditCardId: "card-1",
      description: "Renamed",
      id: "early-1",
    });
  });

  it("SHOULD NOT save a locked payment without a description", () => {
    spies.params.mockReturnValue({
      creditCardId: "card-1",
      id: "early-1",
      invoiceMonth: "2026-08",
    });
    givenLoaded(true);
    const { result } = setup();

    act(() => result.current.onDescriptionChange("  "));
    act(() => result.current.onSave("Early payment"));

    expect(update()).not.toHaveBeenCalled();
  });

  it("SHOULD delete after the confirmation", () => {
    givenLoaded(true);
    const { result } = setup();

    act(() => result.current.onDeletePress());
    expect(result.current.isDeleteOpen).toBe(true);
    act(() => result.current.onDeleteConfirm());

    expect(remove()).toHaveBeenCalledWith({
      creditCardId: "card-1",
      id: "early-1",
    });
    act(() => result.current.onDeleteCancel());
    expect(result.current.isDeleteOpen).toBe(false);
  });
});

it("SHOULD refresh everything AND close WHEN saved", () => {
  givenLoaded();
  mutations.createFinancialEarlyPaymentUseCase.withStatus("success");

  setup();

  expect(spies.invalidate).toHaveBeenCalledWith([
    "getFinancialAccountsUseCase",
  ]);
  expect(spies.invalidate).toHaveBeenCalledWith(["getMonthSummaryUseCase"]);
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD map a save error to its copy key AND close on demand", () => {
  givenLoaded();
  mutations.createFinancialEarlyPaymentUseCase.withError();
  const { result } = setup();

  expect(result.current.formErrorKey).toBe("common.errors.generic");
  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});
