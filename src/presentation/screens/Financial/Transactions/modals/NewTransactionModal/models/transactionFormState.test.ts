import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  changeDate,
  changeInstallmentsOn,
  changeOwner,
  changePaid,
  changePayWith,
  changeRepeatOn,
  changeType,
  chipCategories,
  createInitialState,
  defaultAccountId,
  defaultCardId,
  isSameState,
  normalizeDate,
  pickNewRecordId,
  resetForNext,
  stateFromDto,
  toCreateInstallmentParams,
  toCreateParams,
  toCreateRecurrenceParams,
  toUpdateParams,
  TransactionFormState,
  validate,
} from "./transactionFormState";

function account(id: string, ownerId: string, status = "ACTIVE") {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name: id,
    owner: "USER",
    ownerId,
    status,
  });
}
function category(id: string, ownerId: string, type: string) {
  return new CategoryDTO({
    icon: "food",
    id,
    name: id,
    owner: "USER",
    ownerId,
    type,
  });
}

const accounts = [
  account("archived", "user-id", "ARCHIVED"),
  account("active", "user-id"),
  account("family-acc", "family-1"),
];
const categories = [
  category("food", "user-id", "EXPENSE"),
  category("salary", "user-id", "INCOME"),
  category("rent", "family-1", "EXPENSE"),
];
const user = new OwnerDTO({
  id: "user-id",
  name: "Alice",
  type: OwnerType.USER,
});
const now = new Date(2026, 9, 5, 15, 45);

function state(
  overrides: Partial<TransactionFormState> = {},
): TransactionFormState {
  return {
    accountId: "active",
    amountCents: 31290,
    categoryId: "food",
    date: new Date(2026, 9, 5),
    description: "Groceries",
    installmentsCount: 2,
    installmentsOn: false,
    notes: "",
    ownerId: "user-id",
    paid: true,
    paidTouched: false,
    payWith: "ACCOUNT",
    repeatEnd: undefined,
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    tags: [],
    type: TransactionType.EXPENSE,
    ...overrides,
  };
}

it("SHOULD pick the first ACTIVE account of the owner as default", () => {
  expect(defaultAccountId(accounts, "user-id")).toBe("active");
  expect(
    defaultAccountId([account("archived", "user-id", "ARCHIVED")], "user-id"),
  ).toBeUndefined();
  expect(defaultAccountId(accounts, "nobody")).toBeUndefined();
});

it("SHOULD create an expense form for today with the default account", () => {
  expect(createInitialState({ accounts, now, ownerId: "user-id" })).toEqual({
    accountId: "active",
    amountCents: 0,
    categoryId: undefined,
    creditCardId: undefined,
    date: new Date(2026, 9, 5),
    description: "",
    installmentsCount: 2,
    installmentsOn: false,
    notes: "",
    ownerId: "user-id",
    paid: true,
    paidTouched: false,
    payWith: "ACCOUNT",
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    tags: [],
    type: TransactionType.EXPENSE,
  });
});

it("SHOULD build the state of an existing transaction from its DTO", () => {
  const dto = new TransactionDTO({
    accountId: "active",
    category: "Food",
    categoryId: "food",
    date: new Date(2026, 8, 30).toISOString(),
    description: "Shop",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    type: "INCOME",
    value: "312.90",
  });

  expect(stateFromDto(dto)).toEqual({
    accountId: "active",
    amountCents: 31290,
    categoryId: "food",
    creditCardId: undefined,
    date: new Date(2026, 8, 30),
    description: "Shop",
    installmentsCount: 2,
    installmentsOn: false,
    notes: "",
    originalPaid: true,
    ownerId: "user-id",
    paid: true,
    paidTouched: true,
    payWith: "ACCOUNT",
    repeatFrequency: "MONTHLY",
    repeatOn: false,
    tags: [],
    type: TransactionType.INCOME,
  });
});

it("SHOULD clear a category of the other type WHEN the type changes", () => {
  expect(
    changeType(state(), TransactionType.INCOME, categories).categoryId,
  ).toBeUndefined();
  expect(
    changeType(
      state({ categoryId: "salary", type: TransactionType.INCOME }),
      TransactionType.EXPENSE,
      categories,
    ).categoryId,
  ).toBeUndefined();
  expect(
    changeType(state(), TransactionType.EXPENSE, categories).categoryId,
  ).toBe("food");
});

it("SHOULD keep amount and description WHEN the type changes", () => {
  const next = changeType(state(), TransactionType.INCOME, categories);

  expect(next.amountCents).toBe(31290);
  expect(next.description).toBe("Groceries");
  expect(next.type).toBe(TransactionType.INCOME);
});

it("SHOULD clear category and swap the account WHEN the owner changes", () => {
  const next = changeOwner(state(), "family-1", categories, accounts);

  expect(next.ownerId).toBe("family-1");
  expect(next.categoryId).toBeUndefined();
  expect(next.accountId).toBe("family-acc");
});

it("SHOULD clear the account WHEN the new owner has no active account", () => {
  const next = changeOwner(state(), "family-2", categories, accounts);

  expect(next.accountId).toBeUndefined();
});

it("SHOULD keep selections that already belong to the owner", () => {
  const next = changeOwner(state(), "user-id", categories, accounts);

  expect(next.categoryId).toBe("food");
  expect(next.accountId).toBe("active");
});

describe("validate", () => {
  it("SHOULD accept a complete form", () => {
    expect(validate(state())).toEqual({});
  });

  it("SHOULD require amount greater than zero", () => {
    expect(validate(state({ amountCents: 0 })).amount).toBe(
      "financial.transactions.form.errors.amountRequired",
    );
  });

  it("SHOULD reject amounts above 2147483647 cents and accept the limit", () => {
    expect(validate(state({ amountCents: 2147483648 })).amount).toBe(
      "financial.transactions.form.errors.amountTooLarge",
    );
    expect(validate(state({ amountCents: 2147483647 })).amount).toBeUndefined();
  });

  it("SHOULD require a description and limit it to 200 characters", () => {
    expect(validate(state({ description: "   " })).description).toBe(
      "financial.transactions.form.errors.descriptionRequired",
    );
    expect(validate(state({ description: "a".repeat(201) })).description).toBe(
      "financial.transactions.form.errors.descriptionTooLong",
    );
    expect(
      validate(state({ description: "a".repeat(200) })).description,
    ).toBeUndefined();
  });

  it("SHOULD require category and account", () => {
    const errors = validate(
      state({ accountId: undefined, categoryId: undefined }),
    );

    expect(errors.categoryId).toBe(
      "financial.transactions.form.errors.categoryRequired",
    );
    expect(errors.accountId).toBe(
      "financial.transactions.form.errors.accountRequired",
    );
  });

  it("SHOULD reject an invalid date", () => {
    expect(validate(state({ date: new Date("invalid") })).date).toBe(
      "financial.transactions.form.errors.dateRequired",
    );
  });
});

it("SHOULD compare states by value including the date", () => {
  expect(isSameState(state(), state())).toBe(true);
  expect(isSameState(state(), state({ amountCents: 1 }))).toBe(false);
  expect(isSameState(state(), state({ date: new Date(2026, 9, 6) }))).toBe(
    false,
  );
});

it("SHOULD build create params with the decimal string value and trimmed description", () => {
  expect(
    toCreateParams(state({ description: " Groceries " }), user, "Food"),
  ).toEqual({
    accountId: "active",
    category: "Food",
    categoryId: "food",
    date: new Date(2026, 9, 5).toISOString(),
    description: "Groceries",
    owner: "USER",
    ownerId: "user-id",
    paid: true,
    tags: [],
    type: "EXPENSE",
    value: "312.90",
  });
});

it("SHOULD build update params with the transaction id", () => {
  expect(toUpdateParams("tx-1", state(), user, "Food")).toMatchObject({
    id: "tx-1",
    owner: "USER",
    value: "312.90",
  });
});

it("SHOULD append the selected category to the chips WHEN it is not in the top list", () => {
  const top = [categories[0]];
  const all = categories;

  expect(chipCategories(top, "salary", all).map((c) => c.id)).toEqual([
    "food",
    "salary",
  ]);
  expect(chipCategories(top, "food", all).map((c) => c.id)).toEqual(["food"]);
  expect(chipCategories(top, undefined, all).map((c) => c.id)).toEqual([
    "food",
  ]);
  expect(chipCategories(top, "gone", all).map((c) => c.id)).toEqual(["food"]);
});

it("SHOULD find the id of a newly created record", () => {
  expect(pickNewRecordId(["a"], [{ id: "a" }, { id: "b" }])).toBe("b");
  expect(pickNewRecordId(["a"], [{ id: "a" }])).toBeUndefined();
  expect(pickNewRecordId([], [])).toBeUndefined();
});

it("SHOULD normalize a date to local midnight", () => {
  expect(normalizeDate(new Date(2026, 9, 5, 23, 59))).toEqual(
    new Date(2026, 9, 5),
  );
});

describe("card mode (spec 029)", () => {
  const cards = [
    new CreditCardDTO({
      brand: "VISA",
      closingDay: 31,
      color: "#2B3A8C",
      dueDay: 10,
      id: "card-1",
      limit: 100000,
      owner: "USER",
      ownerId: "user-id",
      status: "ACTIVE",
      title: "Main",
    }),
    new CreditCardDTO({
      brand: "VISA",
      closingDay: 31,
      color: "#2B3A8C",
      dueDay: 10,
      id: "card-family",
      limit: 100000,
      owner: "FAMILY",
      ownerId: "family-1",
      status: "ACTIVE",
      title: "Family",
    }),
  ];

  it("SHOULD pick the first ACTIVE card of the owner as default", () => {
    expect(defaultCardId(cards, "user-id")).toBe("card-1");
    expect(defaultCardId(cards, "nobody")).toBeUndefined();
  });

  it("SHOULD switch to Card: fixes the type to EXPENSE, drops an income category AND selects a card", () => {
    const next = changePayWith(
      state({ categoryId: "salary", type: TransactionType.INCOME }),
      "CARD",
      categories,
      cards,
    );

    expect(next).toMatchObject({
      categoryId: undefined,
      creditCardId: "card-1",
      payWith: "CARD",
      type: TransactionType.EXPENSE,
    });
  });

  it("SHOULD switch back to Account without touching the rest", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
    const card = state({ creditCardId: "card-1", payWith: "CARD" });

    expect(changePayWith(card, "ACCOUNT", categories, cards)).toEqual({
      ...card,
      payWith: "ACCOUNT",
    });
    jest.useRealTimers();
  });

  it("SHOULD change the card WHEN the owner changes to one the card does not belong to", () => {
    const next = changeOwner(
      state({ creditCardId: "card-1", payWith: "CARD" }),
      "family-1",
      categories,
      accounts,
      cards,
    );

    expect(next.creditCardId).toBe("card-family");
  });

  it('SHOULD start on a card ("Add purchase") with the card\'s owner', () => {
    const initial = createInitialState({
      accounts,
      card: cards[1],
      now,
      ownerId: "user-id",
    });

    expect(initial).toMatchObject({
      creditCardId: "card-family",
      ownerId: "family-1",
      payWith: "CARD",
    });
  });

  it("SHOULD require a card (and no account) in Card mode", () => {
    const card = state({ accountId: undefined, payWith: "CARD" });

    expect(validate(card).creditCardId).toBe(
      "financial.transactions.form.errors.cardRequired",
    );
    expect(validate(card).accountId).toBeUndefined();
    expect(
      validate({ ...card, creditCardId: "card-1" }).creditCardId,
    ).toBeUndefined();
  });

  it("SHOULD send creditCardId and no accountId WHEN paying with a card", () => {
    const card = state({ creditCardId: "card-1", payWith: "CARD" });

    expect(toCreateParams(card, user, "Food")).toMatchObject({
      accountId: undefined,
      creditCardId: "card-1",
    });
    expect(toCreateParams(state(), user, "Food")).toMatchObject({
      accountId: "active",
      creditCardId: undefined,
    });
  });

  it("SHOULD read the card of a purchase from its DTO AND count card switches as changes", () => {
    const fromDto = stateFromDto(
      new TransactionDTO({
        category: "Food",
        categoryId: "food",
        creditCardId: "card-1",
        date: new Date(2026, 9, 2).toISOString(),
        description: "Market",
        id: "p1",
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
        value: "10.00",
      }),
    );

    expect(fromDto).toMatchObject({ creditCardId: "card-1", payWith: "CARD" });
    expect(isSameState(fromDto, { ...fromDto, payWith: "ACCOUNT" })).toBe(
      false,
    );
    expect(isSameState(fromDto, { ...fromDto, creditCardId: "x" })).toBe(false);
  });
});

describe("installments (spec 030)", () => {
  function cardState(overrides: Partial<TransactionFormState> = {}) {
    return state({
      accountId: undefined,
      creditCardId: "c1",
      payWith: "CARD",
      ...overrides,
    });
  }

  it("SHOULD start with installments off and reset them WHEN switching back to Account", () => {
    const on = cardState({ installmentsCount: 10, installmentsOn: true });

    expect(createInitialState({ accounts, now, ownerId: "user-id" })).toEqual(
      expect.objectContaining({ installmentsCount: 2, installmentsOn: false }),
    );
    expect(changePayWith(on, "ACCOUNT", categories, [])).toEqual(
      expect.objectContaining({ installmentsCount: 2, installmentsOn: false }),
    );
  });

  it("SHOULD treat the installment fields as part of a dirty form", () => {
    expect(isSameState(cardState(), cardState({ installmentsOn: true }))).toBe(
      false,
    );
    expect(isSameState(cardState(), cardState({ installmentsCount: 5 }))).toBe(
      false,
    );
  });

  it("SHOULD validate the count only WHEN installments are on in Card mode", () => {
    expect(validate(cardState({ installmentsCount: 1 })).installments).toBe(
      undefined,
    );
    expect(
      validate(cardState({ installmentsCount: 1, installmentsOn: true }))
        .installments,
    ).toBe("financial.transactions.form.errors.installmentsRange");
    expect(
      validate(cardState({ installmentsCount: 49, installmentsOn: true }))
        .installments,
    ).toBeDefined();
    expect(
      validate(
        cardState({
          amountCents: 5,
          installmentsCount: 10,
          installmentsOn: true,
        }),
      ).installments,
    ).toBeDefined();
    expect(
      validate(
        cardState({
          amountCents: 512000,
          installmentsCount: 10,
          installmentsOn: true,
        }),
      ).installments,
    ).toBeUndefined();
  });

  it("SHOULD build the plan params with the TOTAL as a decimal string", () => {
    expect(
      toCreateInstallmentParams(
        cardState({ amountCents: 512000, installmentsCount: 10 }),
        user,
      ),
    ).toEqual({
      categoryId: "food",
      creditCardId: "c1",
      date: new Date(2026, 9, 5).toISOString(),
      description: "Groceries",
      installments: 10,
      owner: user.type,
      ownerId: "user-id",
      tags: [],
      value: "5120.00",
    });
  });

  it("SHOULD read the installment count of a stored purchase", () => {
    const dto = new TransactionDTO({
      category: "Food",
      categoryId: "food",
      creditCardId: "c1",
      date: new Date(2026, 9, 5).toISOString(),
      description: "Notebook",
      id: "t1",
      installmentCount: 10,
      owner: "USER",
      ownerId: "user-id",
      tags: [],
      type: "EXPENSE",
      value: "10.00",
    });

    expect(stateFromDto(dto)).toEqual(
      expect.objectContaining({ installmentsCount: 10, installmentsOn: false }),
    );
  });
});

describe("paid switch (spec 033 FR 19)", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("SHOULD follow the date on create until the user touches the switch", () => {
    const toNextMonth = changeDate(state(), new Date(2026, 10, 3), false);
    const backToToday = changeDate(toNextMonth, new Date(2026, 9, 15), false);

    expect(toNextMonth.paid).toBe(false);
    expect(backToToday.paid).toBe(true);
  });

  it("SHOULD keep the user's choice WHEN the date changes after touching the switch", () => {
    const touched = changePaid(
      state({ date: new Date(2026, 9, 15) }),
      false,
      false,
    );

    expect(changeDate(touched, new Date(2026, 9, 1), false).paid).toBe(false);
    expect(changeDate(touched, new Date(2026, 10, 1), false).paid).toBe(false);
  });

  it("SHOULD set the date to today WHEN turning it on with a future date on create", () => {
    const future = state({ date: new Date(2026, 10, 3), paid: false });

    expect(changePaid(future, true, false).date).toEqual(new Date(2026, 9, 15));
    expect(
      changePaid(
        state({ date: new Date(2026, 9, 1), paid: false }),
        true,
        false,
      ).date,
    ).toEqual(new Date(2026, 9, 1));
  });

  it("SHOULD never follow the date on edit AND set today when an unpaid row is marked paid", () => {
    const stored = state({
      date: new Date(2026, 9, 10),
      originalPaid: false,
      paid: false,
      paidTouched: true,
    });

    expect(changeDate(stored, new Date(2026, 9, 1), true).paid).toBe(false);

    const paying = changePaid(stored, true, true);

    expect(paying.paid).toBe(true);
    expect(paying.date).toEqual(new Date(2026, 9, 15));
    expect(changeDate(paying, new Date(2026, 9, 12), true).date).toEqual(
      new Date(2026, 9, 12),
    );
  });

  it("SHOULD keep the date WHEN turning it off AND WHEN a paid row is toggled back on", () => {
    const paidRow = state({
      date: new Date(2026, 9, 10),
      originalPaid: true,
      paid: true,
      paidTouched: true,
    });
    const off = changePaid(paidRow, false, true);

    expect(off.date).toEqual(new Date(2026, 9, 10));
    expect(changePaid(off, true, true).date).toEqual(new Date(2026, 9, 10));
  });

  it("SHOULD send paid for account rows only", () => {
    const owner = user;

    expect(toCreateParams(state({ paid: false }), owner, "Food").paid).toBe(
      false,
    );
    expect(
      toCreateParams(
        state({ creditCardId: "card-1", paid: false, payWith: "CARD" }),
        owner,
        "Food",
      ).paid,
    ).toBeUndefined();
  });

  it("SHOULD restart the status from the date WHEN a card row moves back to an account", () => {
    const fromCard = state({
      date: new Date(2026, 10, 3),
      paid: true,
      paidTouched: true,
      payWith: "CARD",
    });

    const next = changePayWith(fromCard, "ACCOUNT", [], []);

    expect(next.paid).toBe(false);
    expect(next.paidTouched).toBe(false);
  });
});

describe("repeat (spec 034)", () => {
  it("SHOULD start with Repeat off, monthly and without an end date", () => {
    const initial = createInitialState({
      accounts,
      now,
      ownerId: "user-id",
    });

    expect(initial).toMatchObject({
      repeatEnd: undefined,
      repeatFrequency: "MONTHLY",
      repeatOn: false,
    });
  });

  it("SHOULD turn Installments off WHEN Repeat is turned on AND the other way around (FR 17)", () => {
    const withInstallments = state({ installmentsOn: true, payWith: "CARD" });
    const repeating = changeRepeatOn(withInstallments, true);

    expect(repeating).toMatchObject({ installmentsOn: false, repeatOn: true });
    expect(changeInstallmentsOn(repeating, true)).toMatchObject({
      installmentsOn: true,
      repeatOn: false,
    });
  });

  it("SHOULD keep the other switch WHEN one is turned off", () => {
    expect(
      changeRepeatOn(state({ installmentsOn: true, repeatOn: false }), false),
    ).toMatchObject({ installmentsOn: true, repeatOn: false });
    expect(
      changeInstallmentsOn(
        state({ installmentsOn: false, repeatOn: true }),
        false,
      ),
    ).toMatchObject({ installmentsOn: false, repeatOn: true });
  });

  it("SHOULD build the recurrence params: occurrence 1 date, end date, frequency AND paid for an account series", () => {
    const params = toCreateRecurrenceParams(
      state({
        repeatEnd: new Date(2027, 8, 5),
        repeatFrequency: "WEEKLY",
        repeatOn: true,
      }),
      user,
    );

    expect(params).toEqual({
      accountId: "active",
      categoryId: "food",
      creditCardId: undefined,
      date: new Date(2026, 9, 5).toISOString(),
      description: "Groceries",
      endDate: new Date(2027, 8, 5).toISOString(),
      frequency: "WEEKLY",
      owner: user.type,
      ownerId: "user-id",
      paid: true,
      tags: [],
      type: TransactionType.EXPENSE,
      value: "312.90",
    });
  });

  it("SHOULD send a card series without account, paid AND end date", () => {
    const params = toCreateRecurrenceParams(
      state({ creditCardId: "card-1", payWith: "CARD", repeatOn: true }),
      user,
    );

    expect(params).toMatchObject({
      accountId: undefined,
      creditCardId: "card-1",
      endDate: undefined,
      paid: undefined,
    });
  });

  it("SHOULD reject an end date before the first date, only WHEN repeating", () => {
    const early = new Date(2026, 9, 4);

    expect(
      validate(state({ repeatEnd: early, repeatOn: true })).repeatEnd,
    ).toBe("financial.transactions.form.errors.repeatEndBeforeStart");
    expect(
      validate(state({ repeatEnd: early, repeatOn: false })).repeatEnd,
    ).toBeUndefined();
    expect(
      validate(state({ repeatEnd: new Date(2026, 9, 5), repeatOn: true }))
        .repeatEnd,
    ).toBeUndefined();
  });

  it("SHOULD show the series of the occurrence being edited", () => {
    const series = new RecurrenceDTO({
      category: "Rent",
      categoryId: "food",
      description: "Rent",
      endDate: new Date(2027, 8, 5).toISOString(),
      firstNumber: 1,
      frequency: "BIWEEKLY",
      id: "series-1",
      occurrenceCount: 12,
      owner: "USER",
      ownerId: "user-id",
      startDate: new Date(2026, 9, 5).toISOString(),
      status: "ACTIVE",
      type: "EXPENSE",
      value: "10.00",
    });
    const dto = new TransactionDTO({
      accountId: "active",
      category: "Rent",
      categoryId: "food",
      date: new Date(2026, 9, 5).toISOString(),
      description: "Rent",
      id: "t-1",
      owner: "USER",
      ownerId: "user-id",
      recurrenceId: "series-1",
      type: "EXPENSE",
      value: "10.00",
    });

    expect(stateFromDto(dto, series)).toMatchObject({
      repeatEnd: new Date(2027, 8, 5),
      repeatFrequency: "BIWEEKLY",
      repeatOn: true,
    });
    expect(stateFromDto(dto)).toMatchObject({
      repeatEnd: undefined,
      repeatFrequency: "MONTHLY",
      repeatOn: true,
    });
    expect(
      stateFromDto({ ...dto, recurrenceId: undefined } as TransactionDTO)
        .repeatOn,
    ).toBe(false);
  });

  it("SHOULD see a repeat change as a change of the form", () => {
    expect(isSameState(state(), state({ repeatOn: true }))).toBe(false);
    expect(isSameState(state(), state({ repeatFrequency: "YEARLY" }))).toBe(
      false,
    );
    expect(
      isSameState(state(), state({ repeatEnd: new Date(2027, 1, 1) })),
    ).toBe(false);
    expect(isSameState(state(), state())).toBe(true);
  });
});

it("SHOULD keep an All category WHEN the new owner is one of its scopes", () => {
  const all = new CategoryDTO({
    icon: "food",
    id: "all",
    name: "Mercado",
    owner: "USER",
    ownerId: "user-id",
    scope: "ALL",
    scopeOwnerIds: ["user-id", "family-1"],
    type: "EXPENSE",
  });
  const withAll = [...categories, all];

  expect(
    changeOwner(state({ categoryId: "all" }), "family-1", withAll, accounts)
      .categoryId,
  ).toBe("all");
  expect(
    changeOwner(state({ categoryId: "all" }), "family-2", withAll, accounts)
      .categoryId,
  ).toBeUndefined();
});

describe("resetForNext", () => {
  const filled = state({
    accountId: "active",
    categoryId: "food",
    date: new Date(2026, 9, 1),
    installmentsCount: 6,
    installmentsOn: true,
    ownerId: "family-1",
    paid: false,
    paidTouched: true,
    repeatEnd: new Date(2027, 0, 1),
    repeatFrequency: "WEEKLY",
    repeatOn: true,
    type: TransactionType.INCOME,
  });

  it("SHOULD keep type, category, account, card, pay with, date and owner", () => {
    const card = state({
      accountId: undefined,
      creditCardId: "c1",
      payWith: "CARD",
    });

    expect(resetForNext(filled)).toMatchObject({
      accountId: "active",
      categoryId: "food",
      date: new Date(2026, 9, 1),
      ownerId: "family-1",
      payWith: "ACCOUNT",
      type: TransactionType.INCOME,
    });
    expect(resetForNext(card)).toMatchObject({
      creditCardId: "c1",
      payWith: "CARD",
    });
  });

  it("SHOULD clear amount and description", () => {
    expect(resetForNext(filled)).toMatchObject({
      amountCents: 0,
      description: "",
    });
  });

  it("SHOULD turn repeat and installments off with the create defaults", () => {
    const initial = createInitialState({ accounts, now, ownerId: "user-id" });

    expect(resetForNext(filled)).toMatchObject({
      installmentsCount: initial.installmentsCount,
      installmentsOn: false,
      repeatEnd: initial.repeatEnd,
      repeatFrequency: initial.repeatFrequency,
      repeatOn: false,
    });
  });

  it("SHOULD make Paid follow a past date again", () => {
    expect(resetForNext(filled)).toMatchObject({
      paid: true,
      paidTouched: false,
    });
  });

  it("SHOULD make Paid off again for a future date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    expect(
      resetForNext(state({ date: future, paid: true, paidTouched: true })),
    ).toMatchObject({ paid: false, paidTouched: false });
  });
});

describe("tags (spec 043)", () => {
  it("SHOULD keep the tags WHEN resetting for the next transaction", () => {
    const next = resetForNext(state({ tags: ["fixo", "viagem"] }));

    expect(next.tags).toEqual(["fixo", "viagem"]);
    expect(next.amountCents).toBe(0);
  });

  it("SHOULD count the tags (and their order) as a change", () => {
    expect(isSameState(state({ tags: ["a"] }), state({ tags: ["a"] }))).toBe(
      true,
    );
    expect(isSameState(state({ tags: ["a"] }), state({ tags: ["b"] }))).toBe(
      false,
    );
    expect(
      isSameState(state({ tags: ["a", "b"] }), state({ tags: ["b", "a"] })),
    ).toBe(false);
    expect(isSameState(state({ tags: ["a"] }), state())).toBe(false);
  });

  it("SHOULD send the tag names on every create and update request", () => {
    const tagged = state({ tags: ["fixo"] });

    expect(toCreateParams(tagged, user, "Food").tags).toEqual(["fixo"]);
    expect(toUpdateParams("tx-1", tagged, user, "Food").tags).toEqual(["fixo"]);
    expect(toCreateInstallmentParams(tagged, user).tags).toEqual(["fixo"]);
    expect(toCreateRecurrenceParams(tagged, user).tags).toEqual(["fixo"]);
  });

  it("SHOULD load the names of the tags of an existing transaction", () => {
    const dto = new TransactionDTO({
      category: "Food",
      categoryId: "food",
      date: new Date(2026, 8, 30).toISOString(),
      description: "Shop",
      id: "tx-1",
      owner: "USER",
      ownerId: "user-id",
      tags: [{ id: "t1", name: "viagem" }],
      type: "EXPENSE",
      value: "1.00",
    });

    expect(stateFromDto(dto).tags).toEqual(["viagem"]);
  });
});

describe("notes (spec 059)", () => {
  const withNotes = state({ notes: "  Casa\nAeroporto  " });

  it("SHOULD fill the notes from the stored transaction, null meaning empty", () => {
    const dto = new TransactionDTO({
      accountId: "active",
      category: "Food",
      categoryId: "food",
      date: new Date(2026, 8, 30).toISOString(),
      description: "Shop",
      id: "tx-1",
      notes: "Casa → Aeroporto",
      owner: "USER",
      ownerId: "user-id",
      type: "EXPENSE",
      value: "10.00",
    });

    expect(stateFromDto(dto).notes).toBe("Casa → Aeroporto");
  });

  it("SHOULD send trimmed notes on create AND nothing WHEN empty", () => {
    expect(toCreateParams(withNotes, user, "Food").notes).toBe(
      "Casa\nAeroporto",
    );
    expect(toCreateParams(state(), user, "Food").notes).toBeUndefined();
    expect(
      toCreateParams(state({ notes: "   " }), user, "Food").notes,
    ).toBeUndefined();
  });

  it("SHOULD send null on update WHEN the notes were cleared (absent would keep them)", () => {
    expect(toUpdateParams("tx-1", withNotes, user, "Food").notes).toBe(
      "Casa\nAeroporto",
    );
    expect(
      toUpdateParams("tx-1", state({ notes: "" }), user, "Food").notes,
    ).toBeNull();
  });

  it("SHOULD send the notes in installments and repeat params", () => {
    expect(toCreateInstallmentParams(withNotes, user).notes).toBe(
      "Casa\nAeroporto",
    );
    expect(toCreateRecurrenceParams(withNotes, user).notes).toBe(
      "Casa\nAeroporto",
    );
  });

  it("SHOULD clear the notes WHEN resetting for the next transaction", () => {
    expect(resetForNext(withNotes).notes).toBe("");
  });

  it("SHOULD see a change of the notes as a different state", () => {
    expect(isSameState(state(), state({ notes: "x" }))).toBe(false);
  });
});
