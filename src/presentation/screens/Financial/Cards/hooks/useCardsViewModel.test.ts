import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import {
  archivedFamily,
  card,
  cardsQuery,
  givenData,
  owners,
  setup,
  spies,
} from "./mocks/useCardsViewModel.mocks";
import { fetchCards } from "./useCardsViewModel";

describe("fetchCards", () => {
  it("SHOULD load owners, then the overview and the list of those owners", async () => {
    spies.getOwners.mockResolvedValue([owners[0]]);
    spies.getOverview.mockResolvedValue("overview" as never);
    spies.getCards.mockResolvedValue(["cards"] as never);

    const result = await fetchCards();

    expect(spies.getOverview).toHaveBeenCalledWith(["user-id"]);
    expect(spies.getCards).toHaveBeenCalledWith(["user-id"]);
    expect(result).toEqual({
      cards: ["cards"],
      overview: "overview",
      owners: [owners[0]],
    });
  });
});

function referenceMonths(
  entries: ReturnType<typeof setup>["result"]["current"]["entries"],
) {
  return entries.flatMap((entry) =>
    entry.kind === "invoice" ? [entry.invoice.referenceMonth] : [],
  );
}

it("SHOULD aggregate only the cards of the selected owner", () => {
  givenData([
    card("a", 500000, "ACTIVE", "user-id"),
    card("b", 300000, "ACTIVE", "family-1"),
  ]);
  const { result } = setup();

  expect(result.current.aggregate.totalLimit).toBe(800000);
  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });
  expect(result.current.aggregate.totalLimit).toBe(300000);
  expect(result.current.summaries).toHaveLength(1);
});

it("SHOULD select the first card by default AND switch on onCardSelect", () => {
  givenData([card("a", 1000), card("b", 2000)]);
  const { result } = setup();

  expect(result.current.selectedId).toBe("a");
  act(() => {
    result.current.onCardSelect("b");
  });
  expect(result.current.selectedId).toBe("b");
  expect(result.current.selected?.card.id).toBe("b");
});

it("SHOULD fall back to the first visible card WHEN the selected one leaves the filter", () => {
  givenData([
    card("a", 1000, "ACTIVE", "user-id"),
    card("b", 2000, "ACTIVE", "family-1"),
  ]);
  const { result } = setup();

  act(() => {
    result.current.onCardSelect("a");
  });
  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });
  expect(result.current.selectedId).toBe("b");
});

it("SHOULD show the open invoice by default and the closed ones on the closed tab", () => {
  givenData([card("a", 1000)]);
  const { result } = setup();

  expect(result.current.invoiceTab).toBe("open");
  expect(referenceMonths(result.current.entries)).toEqual(["2026-10"]);
  act(() => {
    result.current.onInvoiceTabChange("closed");
  });
  expect(result.current.invoiceTab).toBe("closed");
  expect(referenceMonths(result.current.entries)).toEqual(["2026-09"]);
  act(() => {
    result.current.onInvoiceTabChange("open");
  });
  expect(result.current.invoiceTab).toBe("open");
});

it("SHOULD list archived cards behind the toggle AND expand them", () => {
  givenData([card("a", 1000), card("z", 5000, "ARCHIVED")]);
  const { result } = setup();

  expect(result.current.aggregate.totalLimit).toBe(1000);
  expect(result.current.entries.map((entry) => entry.kind)).toEqual([
    "invoice",
    "archivedToggle",
  ]);
  act(() => {
    result.current.onArchivedToggle();
  });
  expect(result.current.entries.map((entry) => entry.kind)).toEqual([
    "invoice",
    "archivedToggle",
    "archivedRow",
  ]);
  expect(result.current.ownerName("user-id")).toBe("Alice Test");
});

it("SHOULD report no cards WHEN there are none at all, and cards WHEN only archived exist", () => {
  givenData([]);
  expect(setup().result.current.hasCards).toBe(false);

  givenData([card("z", 5000, "ARCHIVED")]);
  expect(setup().result.current.hasCards).toBe(true);
});

it("SHOULD open the form to add, to edit the selected card and to open an archived one", () => {
  givenData([card("a", 1000)]);
  const { result } = setup();

  result.current.onAddPress();
  result.current.onEditPress();
  result.current.onArchivedCardPress("z");

  const { openModal } = modalNavigation;

  expect(openModal).toHaveBeenNthCalledWith(1, "add_new_credit_card");
  expect(openModal).toHaveBeenNthCalledWith(2, "add_new_credit_card", {
    id: "a",
  });
  expect(openModal).toHaveBeenNthCalledWith(3, "add_new_credit_card", {
    id: "z",
  });
});

it("SHOULD NOT push WHEN editing without a selected card", () => {
  givenData([]);
  const { result } = setup();

  result.current.onEditPress();

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

it("SHOULD refetch WHEN the screen is focused", () => {
  givenData([card("a", 1000)]);
  spies.isFocused.mockReturnValue(true);

  setup();

  expect(cardsQuery.value.refetch).toHaveBeenCalled();
});

it("SHOULD mirror loading, refreshing and error from the query", () => {
  cardsQuery.withError(new Error("boom") as never);
  expect(setup().result.current.errorMessage).toBe("boom");
});

it("SHOULD switch to the upcoming tab AND open the invoice detail route", () => {
  givenData([card("a", 1000)]);
  const { result } = setup();

  act(() => {
    result.current.onInvoiceTabChange("upcoming");
  });
  expect(result.current.invoiceTab).toBe("upcoming");

  act(() => {
    result.current.onInvoicePress("a", "2026-10");
  });
  expect(modalNavigation.openModal).toHaveBeenCalledWith("invoice_detail", {
    cardId: "a",
    month: "2026-10",
  });
});

it("SHOULD open the refund and early payment sheets for the selected card (spec 032)", () => {
  givenData([card("a", 1000)]);
  const { result } = setup();

  result.current.onRefundPress();
  result.current.onEarlyPaymentPress();

  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(1, "card_refund", {
    creditCardId: "a",
  });
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    2,
    "card_early_payment",
    { creditCardId: "a" },
  );
});

it("SHOULD NOT open them WHEN no card is selected", () => {
  givenData([]);
  const { result } = setup();

  result.current.onRefundPress();
  result.current.onEarlyPaymentPress();

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

describe("archived family (spec 042)", () => {
  it("SHOULD leave it out of All AND show it read-only when selected", () => {
    givenData(
      [
        card("a", 500000, "ACTIVE", "user-id"),
        card("b", 300000, "ACTIVE", "family-1"),
      ],
      0,
      [owners[0], archivedFamily("family-1")],
    );
    const { result } = setup();

    expect(result.current.aggregate.totalLimit).toBe(500000);
    expect(result.current.readOnly).toBe(false);

    act(() => {
      result.current.onOwnerFilterChange("family-1");
    });

    expect(result.current.readOnly).toBe(true);
    expect(result.current.aggregate.totalLimit).toBe(300000);

    act(() => {
      result.current.onAddPress();
      result.current.onInvoicePress("b", "2026-10");
    });

    expect(modalNavigation.openModal).not.toHaveBeenCalled();
    expect(result.current.toastVisible).toBe(true);
  });
});
