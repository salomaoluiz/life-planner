import { act } from "@tests";

import { makeInvoice } from "../../Transactions/mocks/invoice.mocks";
import {
  account,
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
} from "./mocks/useInvoiceViewModel.mocks";

it("SHOULD expose the loading state until the invoice arrives", () => {
  expect(setup().result.current.invoice).toBeUndefined();

  givenLoaded({ invoice: makeInvoice() });
  expect(setup().result.current.invoice?.amountCents).toBe(45000);
});

it("SHOULD read the invoice of the route params", () => {
  givenLoaded({ invoice: makeInvoice() });
  setup();

  expect(spies.useQuery.mock.calls[0][0].cacheKey).toEqual([
    "invoice",
    "card-1",
    "2026-10",
  ]);
});

it("SHOULD offer only ACTIVE accounts AND require one for ACCOUNT payments", () => {
  givenLoaded({
    accounts: [account("a1"), account("old", "ARCHIVED")],
    invoice: makeInvoice(),
  });
  const { result } = setup();

  act(() => result.current.onPayPress());

  expect(result.current.isPayOpen).toBe(true);
  expect(result.current.accountOptions).toEqual([{ label: "a1", value: "a1" }]);
  expect(result.current.isSubmitDisabled).toBe(true);
  act(() => result.current.onPayConfirm());
  expect(mutations.pay.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD pay with the account and the chosen date (default today)", () => {
  givenLoaded({ invoice: makeInvoice() });
  const { result } = setup();

  act(() => result.current.onPayPress());
  act(() => result.current.onAccountChange("a1"));
  act(() => result.current.onPayConfirm());

  expect(mutations.pay.value.mutate).toHaveBeenCalledWith({
    accountId: "a1",
    creditCardId: "card-1",
    method: "ACCOUNT",
    month: "2026-10",
    paidOn: "2026-11-05",
  });

  act(() => result.current.onPaidOnChange(new Date(2026, 10, 3)));
  act(() => result.current.onPayConfirm());
  expect(mutations.pay.value.mutate).toHaveBeenLastCalledWith(
    expect.objectContaining({ paidOn: "2026-11-03" }),
  );
});

it("SHOULD pay by boleto WITHOUT an account", () => {
  givenLoaded({ invoice: makeInvoice() });
  const { result } = setup();

  act(() => result.current.onMethodChange("EXTERNAL"));
  act(() => result.current.onAccountChange("a1"));
  act(() => result.current.onPayConfirm());

  expect(result.current.method).toBe("EXTERNAL");
  expect(mutations.pay.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ accountId: undefined, method: "EXTERNAL" }),
  );
  act(() => result.current.onMethodChange("ACCOUNT"));
  expect(result.current.method).toBe("ACCOUNT");
});

it("SHOULD undo after the confirmation", () => {
  givenLoaded({ invoice: makeInvoice({ status: "PAID" }) });
  const { result } = setup();

  act(() => result.current.onUndoPress());
  expect(result.current.isUndoOpen).toBe(true);
  act(() => result.current.onUndoConfirm());

  expect(mutations.undo.value.mutate).toHaveBeenCalledWith({
    creditCardId: "card-1",
    month: "2026-10",
  });
  act(() => result.current.onUndoCancel());
  expect(result.current.isUndoOpen).toBe(false);
});

it("SHOULD refresh everything a payment changes AND close the sheets WHEN it succeeds", () => {
  givenLoaded({ invoice: makeInvoice() });
  mutations.pay.withStatus("success");

  const { result } = setup();

  expect(result.current.isPayOpen).toBe(false);
  expect(spies.invalidate).toHaveBeenCalledWith(["accounts"]);
  expect(spies.invalidate).toHaveBeenCalledWith(["overview"]);
  expect(spies.invalidate).toHaveBeenCalledWith(["invoices"]);
  expect(spies.invalidate).toHaveBeenCalledWith(["summary"]);
  expect(queries.invoice.value.refetch).toHaveBeenCalled();
});

it("SHOULD map a payment error to its copy key", () => {
  givenLoaded({ invoice: makeInvoice() });
  mutations.pay.withError();

  expect(setup().result.current.formErrorKey).toBe("common.errors.generic");
});

it("SHOULD navigate to the add form with the card AND to a purchase edit AND close", () => {
  givenLoaded({ invoice: makeInvoice() });
  const { result } = setup();

  act(() => result.current.onAddPurchasePress());
  expect(spies.replace).toHaveBeenCalledWith({
    params: { creditCardId: "card-1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
  act(() => result.current.onPurchasePress("p1"));
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: { id: "p1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
  act(() => result.current.onClose());
  expect(spies.back).toHaveBeenCalled();
});

it("SHOULD open the refund and early payment sheets for this invoice (spec 032)", () => {
  givenLoaded({ invoice: makeInvoice() });
  const { result } = setup();

  act(() => result.current.onRefundPress());
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: { creditCardId: "card-1", invoiceMonth: "2026-10" },
    pathname: "/financial/refund/card_refund",
  });
  act(() => result.current.onEarlyPaymentPress());
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: { creditCardId: "card-1", invoiceMonth: "2026-10" },
    pathname: "/financial/early_payment/card_early_payment",
  });
});

it("SHOULD edit a credit in the sheet of its kind", () => {
  givenLoaded({ invoice: makeInvoice() });
  const { result } = setup();
  const credit = { id: "c1", kind: "REFUND" } as never;

  act(() => result.current.onCreditPress(credit));
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: { creditCardId: "card-1", id: "c1" },
    pathname: "/financial/refund/card_refund",
  });
  act(() =>
    result.current.onCreditPress({ id: "c2", kind: "EARLY_PAYMENT" } as never),
  );
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: { creditCardId: "card-1", id: "c2" },
    pathname: "/financial/early_payment/card_early_payment",
  });
});
