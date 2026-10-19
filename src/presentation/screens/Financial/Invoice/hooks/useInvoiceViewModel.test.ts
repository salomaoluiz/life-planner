import { act } from "@tests";

import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";

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
    "list",
    "card-1",
    "2026-10",
  ]);
});

it("SHOULD NOT share its cache key with the raw invoice read by the early payment form", () => {
  givenLoaded({ invoice: makeInvoice() });
  setup();

  // The form caches the DTO under ["invoice", cardId, month]: the UI model must live elsewhere.
  expect(spies.useQuery.mock.calls[0][0].cacheKey.slice(0, 2)).not.toEqual([
    "invoice",
    "card-1",
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
  const credit = {
    amountCents: 50000,
    date: new Date(2026, 9, 16),
    description: "Chargeback",
    id: "c1",
    kind: "REFUND",
    refundedTransactionId: "t1",
  } as never;

  act(() => result.current.onCreditPress(credit));
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: {
      accountId: undefined,
      creditCardId: "card-1",
      date: "2026-10-16",
      description: "Chargeback",
      id: "c1",
      invoiceMonth: "2026-10",
      method: undefined,
      refundedPlanId: undefined,
      refundedTransactionId: "t1",
      value: "50000",
    },
    pathname: "/financial/refund/card_refund",
  });
  act(() =>
    result.current.onCreditPress({
      accountId: "a1",
      amountCents: 60000,
      date: new Date(2026, 9, 16),
      description: "Early payment",
      id: "c2",
      kind: "EARLY_PAYMENT",
      method: "ACCOUNT",
    } as never),
  );
  expect(spies.replace).toHaveBeenLastCalledWith({
    params: expect.objectContaining({
      accountId: "a1",
      id: "c2",
      method: "ACCOUNT",
      value: "60000",
    }),
    pathname: "/financial/early_payment/card_early_payment",
  });
});

describe("projected purchases (spec 034 FR 14)", () => {
  function projected(overrides = {}) {
    return new ProjectedOccurrenceDTO({
      category: "Food",
      categoryId: "cat-1",
      creditCardId: "card-1",
      date: new Date(2026, 11, 28).toISOString(),
      description: "Streaming",
      frequency: "MONTHLY",
      invoiceListDate: "2027-01-05",
      invoiceMonth: "2027-01",
      occurrenceCount: 12,
      occurrenceNumber: 3,
      owner: "USER",
      ownerId: "user-id",
      recurrenceId: "series-1",
      type: "EXPENSE",
      value: "20.00",
      ...overrides,
    });
  }

  function projectionsOptions() {
    return spies.useQuery.mock.calls.find(
      ([option]) =>
        (option as { cacheKey: string[] }).cacheKey[0] === "projections",
    )![0] as { enabled: boolean; fetch: () => Promise<unknown> };
  }

  it("SHOULD not look for projections WHEN the invoice month is the current one or a past one", () => {
    givenLoaded({ invoice: makeInvoice() });
    setup();

    expect(projectionsOptions().enabled).toBe(false);
  });

  it("SHOULD look for the purchases that would land on a future invoice AND keep only that card and month", async () => {
    spies.params.mockReturnValue({ cardId: "card-1", month: "2027-01" });
    givenLoaded({ invoice: makeInvoice({ referenceMonth: "2027-01" }) });
    spies.getProjections.mockResolvedValue([
      projected(),
      projected({ creditCardId: "card-2", occurrenceNumber: 4 }),
      projected({ invoiceMonth: "2027-02", occurrenceNumber: 5 }),
    ]);
    spies.getCategories.mockResolvedValue([]);
    setup();

    const options = projectionsOptions();
    const rows = (await options.fetch()) as { counter?: string; id: string }[];

    expect(options.enabled).toBe(true);
    expect(spies.getProjections).toHaveBeenCalledWith({
      from: "2026-12",
      ownerIds: ["user-id"],
      to: "2027-01",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].counter).toBe("3/12");
  });

  it("SHOULD expose the projected rows AND open one by series, number and month", () => {
    spies.params.mockReturnValue({ cardId: "card-1", month: "2027-01" });
    givenLoaded({ invoice: makeInvoice({ referenceMonth: "2027-01" }) });
    const row = new ProjectedOccurrenceDTO({
      ...projected(),
    }).toTransactionDTO();
    queries.projections.withData([
      { monthKey: "2026-12", occurrenceNumber: 3, recurrenceId: "series-1" },
    ]);
    const { result } = setup();

    expect(result.current.projected).toHaveLength(1);

    act(() =>
      result.current.onProjectedPress(result.current.projected[0] as never),
    );

    expect(spies.replace).toHaveBeenCalledWith({
      params: {
        month: "2026-12",
        occurrenceNumber: "3",
        recurrenceId: "series-1",
      },
      pathname: "/financial/transaction/add_new_transaction",
    });
    expect(row.isProjected).toBe(true);
  });
});

describe("payment account prefill (spec 035)", () => {
  it("SHOULD preselect the linked ACTIVE account WHEN the pay sheet opens", () => {
    givenLoaded({
      accounts: [account("a1"), account("a2")],
      invoice: makeInvoice(),
      linkedAccountId: "a2",
    });
    const { result } = setup();

    expect(result.current.accountId).toBeUndefined();

    act(() => result.current.onPayPress());

    expect(result.current.accountId).toBe("a2");
  });

  it("SHOULD leave it empty WHEN the link is archived, unknown or missing", () => {
    givenLoaded({
      accounts: [account("a1"), account("old", "ARCHIVED")],
      invoice: makeInvoice(),
      linkedAccountId: "old",
    });
    const { result } = setup();

    act(() => result.current.onPayPress());

    expect(result.current.accountId).toBeUndefined();
  });

  it("SHOULD NOT overwrite an account the user already picked", () => {
    givenLoaded({
      accounts: [account("a1"), account("a2")],
      invoice: makeInvoice(),
      linkedAccountId: "a2",
    });
    const { result } = setup();

    act(() => result.current.onAccountChange("a1"));
    act(() => result.current.onPayPress());

    expect(result.current.accountId).toBe("a1");
  });
});
