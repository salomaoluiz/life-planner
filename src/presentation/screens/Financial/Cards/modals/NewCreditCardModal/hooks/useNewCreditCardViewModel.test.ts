import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { CreditCardHasTransactions } from "@domain/entities/errors";

import {
  card,
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
} from "./mocks/useNewCreditCardViewModel.mocks";

function fillValid(result: ReturnType<typeof setup>["result"]) {
  act(() => result.current.onTitleChange(" Main "));
  act(() => result.current.onLimitChange(500000));
  act(() => result.current.onClosingDayChange("5"));
  act(() => result.current.onDueDayChange("8"));
}

it("SHOULD be loading until owners and cards are loaded", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD start a new card with VISA, the first color, the Personal owner and the new copy", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.brand).toBe("VISA");
  expect(result.current.tint).toBe("#6366F1");
  expect(result.current.ownerId).toBe("user-id");
  expect(result.current.titleKey).toBe("financial.cardForm.titleNew");
  expect(result.current.saveLabelKey).toBe("financial.cardForm.save");
});

it("SHOULD prefill in edit mode, keep the owner changeable AND report notFound for an unknown id", () => {
  givenLoaded({
    cards: [card("c1", { status: "ARCHIVED", title: "Travel" })],
    params: { id: "c1" },
  });
  const { result } = setup();

  expect(result.current.title).toBe("Travel");
  expect(result.current.paymentDay).toBe("6");
  expect(result.current.archiveLabelKey).toBe("financial.cardForm.reactivate");
  expect(result.current.titleKey).toBe("financial.cardForm.titleEdit");
  expect(result.current.saveLabelKey).toBe("financial.common.saveChanges");
  act(() => result.current.onOwnerChange("family-1"));
  expect(result.current.ownerId).toBe("family-1");

  givenLoaded({ cards: [card("c1")], params: { id: "gone" } });
  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD NOT show errors before the first save and show them live after", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.titleError).toBeUndefined();
  act(() => result.current.onSave());
  expect(result.current.titleError).toBe(
    "financial.cardForm.errors.titleRequired",
  );
  expect(result.current.limitError).toBe(
    "financial.cardForm.errors.limitRequired",
  );
  expect(result.current.closingDayError).toBe(
    "financial.cardForm.errors.dayRequired",
  );
  expect(mutations.create.value.mutate).not.toHaveBeenCalled();
  act(() => result.current.onTitleChange("Card"));
  expect(result.current.titleError).toBeUndefined();
});

it("SHOULD create the card with the mapped params", () => {
  givenLoaded();
  const { result } = setup();

  fillValid(result);
  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    brand: "VISA",
    closingDay: 5,
    color: "#6366F1",
    dueDay: 8,
    lastDigits: undefined,
    limit: 500000,
    owner: "USER",
    ownerId: "user-id",
    paymentDay: undefined,
    title: "Main",
  });
});

it("SHOULD keep only 4 digits in the last digits field", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onLastDigitsChange("12a3-45678"));

  expect(result.current.lastDigits).toBe("1234");
});

it("SHOULD warn WHEN the payment is after the due date but STILL save", () => {
  givenLoaded();
  const { result } = setup();

  fillValid(result);
  act(() => result.current.onPaymentDayChange("20"));
  act(() => result.current.onDueDayChange("15"));

  expect(result.current.paymentWarning).toBe(true);
  act(() => result.current.onSave());
  expect(mutations.create.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ dueDay: 15, paymentDay: 20 }),
  );
});

it("SHOULD send only the changed fields on update, null to clear the payment day AND the new owner", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  const { result } = setup();

  act(() => result.current.onTitleChange("New"));
  act(() => result.current.onPaymentDayChange(""));
  act(() => result.current.onOwnerChange("family-1"));
  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    owner: "FAMILY",
    ownerId: "family-1",
    paymentDay: null,
    title: "New",
  });
});

it("SHOULD go back without a request WHEN nothing changed in edit", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  const { result } = setup();

  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
});

it("SHOULD archive an active card and reactivate an archived one without validating the form", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  const active = setup();
  act(() => active.result.current.onArchiveToggle());
  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    status: "ARCHIVED",
  });

  mutations.update.reset();
  givenLoaded({
    cards: [card("c1", { status: "ARCHIVED" })],
    params: { id: "c1" },
  });
  const archived = setup();
  act(() => archived.result.current.onArchiveToggle());
  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    status: "ACTIVE",
  });
});

it("SHOULD delete after confirming", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  const { result } = setup();

  act(() => result.current.onDeletePress());
  expect(result.current.isDeleteDialogOpen).toBe(true);
  act(() => result.current.onDeleteConfirm());

  expect(mutations.delete.value.mutate).toHaveBeenCalledWith({ id: "c1" });
  expect(result.current.isDeleteDialogOpen).toBe(false);
});

it("SHOULD map a 409 on delete to the archive-instead message", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  mutations.delete.withError(new CreditCardHasTransactions());

  expect(setup().result.current.formErrorKey).toBe(
    "financial.cards.delete.hasTransactions",
  );
});

it.each(["create", "update", "delete"] as const)(
  "SHOULD invalidate the overview and the list AND go back WHEN %s succeeds",
  (name) => {
    givenLoaded();
    mutations[name].withStatus("success");

    setup();

    expect(spies.invalidate).toHaveBeenCalledWith(["overview"]);
    expect(spies.invalidate).toHaveBeenCalledWith(["cards"]);
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  },
);

it("SHOULD NOT invalidate WHEN a mutation fails", () => {
  givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
  mutations.update.withError();

  setup();

  expect(spies.invalidate).not.toHaveBeenCalled();
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();
});

it("SHOULD ask to discard WHEN closing a dirty form and close directly WHEN clean", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => result.current.onTitleChange("x"));
  act(() => result.current.onClose());
  expect(result.current.isDiscardDialogOpen).toBe(true);
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  act(() => result.current.onDiscardCancel());
  expect(result.current.isDiscardDialogOpen).toBe(false);
  act(() => result.current.onDiscardConfirm());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
});

describe("archiving ends the recurring series (spec 034 FR 34)", () => {
  it("SHOULD warn with the count of active series of an active card", () => {
    givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
    queries.recurrences.withData([{}, {}, {}]);

    expect(setup().result.current.archiveWarningCount).toBe(3);
  });

  it("SHOULD not warn for an archived card OR WHEN there are no series", () => {
    givenLoaded({
      cards: [card("c1", { status: "ARCHIVED" })],
      params: { id: "c1" },
    });
    queries.recurrences.withData([{}]);
    expect(setup().result.current.archiveWarningCount).toBe(0);

    givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
    queries.recurrences.reset();
    expect(setup().result.current.archiveWarningCount).toBe(0);
  });

  it("SHOULD load the series of the card through the use case", async () => {
    givenLoaded({ cards: [card("c1")], params: { id: "c1" } });
    setup();

    const options = spies.useQuery.mock.calls.find(
      ([option]) =>
        (option as { cacheKey: string[] }).cacheKey[0] === "recurrences",
    )![0] as { fetch: () => Promise<unknown> };

    await options.fetch();

    expect(spies.getRecurrences).toHaveBeenCalledWith({
      creditCardId: "c1",
      ownerIds: ["user-id"],
      status: "ACTIVE",
    });
  });
});

describe("payment account (spec 035)", () => {
  const checking = new AccountDTO({
    balance: 0,
    icon: "bank",
    id: "a1",
    name: "Checking",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  });

  it("SHOULD list None plus the active accounts AND send the chosen one on create", () => {
    givenLoaded({ accounts: [checking] });
    const { result } = setup();

    expect(
      result.current.paymentAccountOptions.map((item) => item.value),
    ).toEqual(["", "a1"]);

    act(() => result.current.onTitleChange("Main"));
    act(() => result.current.onLimitChange(500000));
    act(() => result.current.onClosingDayChange("5"));
    act(() => result.current.onDueDayChange("8"));
    act(() => result.current.onPaymentAccountChange("a1"));
    act(() => result.current.onSave());

    expect(mutations.create.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ paymentAccountId: "a1" }),
    );
  });

  it("SHOULD send null WHEN the link is removed in edit", () => {
    givenLoaded({
      accounts: [checking],
      cards: [card("c1", { paymentAccountId: "a1" })],
      params: { id: "c1" },
    });
    const { result } = setup();

    expect(result.current.paymentAccountId).toBe("a1");

    act(() => result.current.onPaymentAccountChange(""));
    act(() => result.current.onSave());

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      id: "c1",
      paymentAccountId: null,
    });
  });

  it("SHOULD keep the id of an account the reader cannot see AND mark it as another member's", () => {
    givenLoaded({
      accounts: [checking],
      cards: [card("c1", { paymentAccountId: "hidden" })],
      params: { id: "c1" },
    });
    const { result } = setup();

    expect(result.current.paymentAccountOptions.at(-1)).toEqual({
      labelKey: "financial.cardForm.paymentAccountOther",
      value: "hidden",
    });
  });
});
