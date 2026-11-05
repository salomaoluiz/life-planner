import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvoiceIsPaid } from "@domain/entities/errors";

import {
  givenLoaded,
  mutations,
  setup,
  spies,
} from "./mocks/useConfirmProjectedViewModel.mocks";

function confirm() {
  return mutations.confirmFinancialTransactionUseCase.value.mutate;
}

it("SHOULD stay loading until the cards arrive", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD prefill the projected value and date, and name the invoice of that date", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.amountCents).toBe(10000);
  expect(result.current.projectedCents).toBe(10000);
  expect(result.current.date).toEqual(new Date(2026, 9, 25));
  expect(result.current.invoiceMonth).toBe("2026-11");
  expect(result.current.isRecurring).toBe(true);
  expect(result.current.differenceCents).toBe(0);
});

it("SHOULD follow the invoice WHEN the charge date moves across the closing day", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onDateChange(new Date(2026, 9, 5)));

  expect(result.current.invoiceMonth).toBe("2026-10");
});

it("SHOULD show the difference to the projected value", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onAmountChange(9990));

  expect(result.current.differenceCents).toBe(-10);
});

it("SHOULD confirm with the real value, the date and the owner of the card", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onAmountChange(9990));
  act(() => result.current.onDateChange(new Date(2026, 9, 24)));
  act(() => result.current.onConfirm());

  expect(confirm()).toHaveBeenCalledWith({
    date: new Date(2026, 9, 24).toISOString(),
    id: "tx-1",
    ownerId: "user-id",
    value: "99.90",
  });
});

it("SHOULD NOT confirm a zero charge AND show the amount error", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onAmountChange(0));
  act(() => result.current.onConfirm());

  expect(confirm()).not.toHaveBeenCalled();
  expect(result.current.amountError).toBe(
    "financial.projected.confirm.errors.amount",
  );
});

it("SHOULD refresh the finance data AND close WHEN the confirm succeeds", () => {
  givenLoaded();
  mutations.confirmFinancialTransactionUseCase.withStatus("success");
  setup();

  expect(spies.invalidateFinance).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD map the error of a paid invoice to its message", () => {
  givenLoaded();
  mutations.confirmFinancialTransactionUseCase.withError(new InvoiceIsPaid());

  expect(setup().result.current.formErrorKey).toBe(
    "financial.errors.invoicePaid",
  );
});
