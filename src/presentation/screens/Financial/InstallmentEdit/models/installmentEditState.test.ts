import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";

import {
  changeScope,
  editableFields,
  initialState,
  isSameState,
  needsRecalcConfirm,
  toPlanUpdate,
  toTransactionUpdate,
  validate,
} from "./installmentEditState";

const plan = new InstallmentPlanDTO({
  categoryId: "cat-1",
  creditCardId: "card-1",
  date: new Date(2026, 9, 20).toISOString(),
  description: "Notebook",
  id: "plan-1",
  installmentCount: 3,
  installments: [],
  owner: "USER",
  ownerId: "user-id",
  totalValue: "100.00",
});
const transaction = new TransactionDTO({
  category: "Tech",
  categoryId: "cat-1",
  creditCardId: "card-1",
  date: new Date(2026, 9, 20).toISOString(),
  description: "Notebook",
  id: "row-2",
  installmentCount: 3,
  installmentNumber: 2,
  installmentPlanId: "plan-1",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
  value: "33.33",
});

describe("editableFields", () => {
  it("SHOULD let Only this one and This and the next ones change value, description and category", () => {
    for (const scope of ["ONLY_THIS", "THIS_AND_NEXT"] as const) {
      expect(editableFields(scope, false)).toEqual({
        amount: true,
        card: false,
        category: true,
        count: false,
        date: false,
        description: true,
      });
    }
  });

  it("SHOULD let All change everything", () => {
    expect(Object.values(editableFields("ALL", false)).every(Boolean)).toBe(
      true,
    );
  });

  it.each(["ALL", "ONLY_THIS", "THIS_AND_NEXT"] as const)(
    "SHOULD leave only description and category WHEN the invoice is paid (%s)",
    (scope) => {
      expect(editableFields(scope, true)).toEqual({
        amount: false,
        card: false,
        category: true,
        count: false,
        date: false,
        description: true,
      });
    },
  );
});

describe("state", () => {
  it("SHOULD start in Only this one with the row value", () => {
    const state = initialState(plan, transaction);

    expect(state).toEqual(
      expect.objectContaining({
        amountCents: 3333,
        count: 3,
        scope: "ONLY_THIS",
      }),
    );
  });

  it("SHOULD show the plan TOTAL for All AND the row value otherwise", () => {
    const state = initialState(plan, transaction);
    const all = changeScope(state, "ALL", plan, transaction);

    expect(all.amountCents).toBe(10000);
    expect(
      changeScope(all, "THIS_AND_NEXT", plan, transaction).amountCents,
    ).toBe(3333);
  });

  it("SHOULD compare states", () => {
    const state = initialState(plan, transaction);

    expect(isSameState(state, { ...state })).toBe(true);
    expect(isSameState(state, { ...state, description: "x" })).toBe(false);
  });
});

describe("needsRecalcConfirm", () => {
  const all = changeScope(
    initialState(plan, transaction),
    "ALL",
    plan,
    transaction,
  );

  it("SHOULD NOT ask WHEN All only changes text", () => {
    expect(needsRecalcConfirm(plan, { ...all, description: "Laptop" })).toBe(
      false,
    );
  });

  it.each([
    { amountCents: 12000 },
    { count: 4 },
    { creditCardId: "card-2" },
    { date: new Date(2026, 10, 1) },
  ])("SHOULD ask WHEN All changes %p", (patch) => {
    expect(needsRecalcConfirm(plan, { ...all, ...patch })).toBe(true);
  });

  it("SHOULD NOT ask outside All", () => {
    const state = initialState(plan, transaction);

    expect(needsRecalcConfirm(plan, { ...state, amountCents: 1 })).toBe(false);
  });
});

describe("toPlanUpdate", () => {
  const all = changeScope(
    initialState(plan, transaction),
    "ALL",
    plan,
    transaction,
  );

  it("SHOULD send only the text WHEN the structure is unchanged (the API must not recalculate)", () => {
    expect(
      toPlanUpdate(plan, { ...all, description: "Laptop" }, false),
    ).toEqual({
      categoryId: undefined,
      creditCardId: undefined,
      date: undefined,
      description: "Laptop",
      id: "plan-1",
      installments: undefined,
      value: undefined,
    });
  });

  it("SHOULD send the new total, count, card and date WHEN they changed", () => {
    const result = toPlanUpdate(
      plan,
      {
        ...all,
        amountCents: 12000,
        count: 4,
        creditCardId: "card-2",
        date: new Date(2026, 10, 2),
      },
      false,
    );

    expect(result).toEqual(
      expect.objectContaining({
        creditCardId: "card-2",
        date: new Date(2026, 10, 2).toISOString(),
        installments: 4,
        value: "120.00",
      }),
    );
  });

  it("SHOULD never send structure WHEN an installment is paid", () => {
    const result = toPlanUpdate(
      plan,
      { ...all, amountCents: 12000, categoryId: "cat-2", count: 4 },
      true,
    );

    expect(result).toEqual(
      expect.objectContaining({
        categoryId: "cat-2",
        installments: undefined,
        value: undefined,
      }),
    );
  });
});

describe("toTransactionUpdate", () => {
  it("SHOULD send the scope AND only the changed fields", () => {
    const state = {
      ...initialState(plan, transaction),
      amountCents: 1500,
      scope: "THIS_AND_NEXT" as const,
    };

    expect(toTransactionUpdate(transaction, state, false)).toEqual({
      categoryId: undefined,
      description: undefined,
      id: "row-2",
      scope: "THIS_AND_NEXT",
      value: "15.00",
    });
  });

  it("SHOULD NOT send the value WHEN the invoice is paid", () => {
    const state = {
      ...initialState(plan, transaction),
      amountCents: 1500,
      description: "Renamed",
    };

    expect(toTransactionUpdate(transaction, state, true)).toEqual(
      expect.objectContaining({
        description: "Renamed",
        scope: "ONLY_THIS",
        value: undefined,
      }),
    );
  });
});

describe("validate", () => {
  const state = initialState(plan, transaction);

  it("SHOULD accept the initial state", () => {
    expect(validate(state, editableFields("ONLY_THIS", false))).toEqual({});
  });

  it("SHOULD require a description, a category and an amount", () => {
    expect(
      validate(
        { ...state, amountCents: 0, categoryId: "", description: "  " },
        editableFields("ONLY_THIS", false),
      ),
    ).toEqual({
      amount: "financial.transactions.form.errors.amountRequired",
      categoryId: "financial.transactions.form.errors.categoryRequired",
      description: "financial.transactions.form.errors.descriptionRequired",
    });
  });

  it("SHOULD ignore the amount WHEN it is locked", () => {
    expect(
      validate({ ...state, amountCents: 0 }, editableFields("ONLY_THIS", true)),
    ).toEqual({});
  });

  it("SHOULD validate the count only in All", () => {
    const fields = editableFields("ALL", false);

    expect(validate({ ...state, count: 1 }, fields).count).toBeDefined();
    expect(validate({ ...state, count: 49 }, fields).count).toBeDefined();
    expect(
      validate({ ...state, amountCents: 5, count: 10 }, fields).count,
    ).toBeDefined();
    expect(
      validate({ ...state, count: 1 }, editableFields("ONLY_THIS", false))
        .count,
    ).toBeUndefined();
  });

  it("SHOULD limit the description length", () => {
    expect(
      validate(
        { ...state, description: "x".repeat(201) },
        editableFields("ONLY_THIS", false),
      ).description,
    ).toBe("financial.transactions.form.errors.descriptionTooLong");
  });
});

describe("notes (spec 059)", () => {
  const noted = new TransactionDTO({
    category: "Tech",
    categoryId: "cat-1",
    creditCardId: "card-1",
    date: new Date(2026, 9, 20).toISOString(),
    description: "Notebook",
    id: "row-2",
    installmentCount: 3,
    installmentNumber: 2,
    installmentPlanId: "plan-1",
    notes: "Presente",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "33.33",
  });

  it("SHOULD start from the notes of the row, empty when it has none", () => {
    expect(initialState(plan, noted).notes).toBe("Presente");
    expect(initialState(plan, transaction).notes).toBe("");
  });

  it("SHOULD send the notes WHEN they changed AND null WHEN cleared, in both scopes", () => {
    const edited = { ...initialState(plan, noted), notes: " Outro " };
    const cleared = { ...initialState(plan, noted), notes: "  " };

    expect(toTransactionUpdate(noted, edited, false).notes).toBe("Outro");
    expect(toTransactionUpdate(noted, cleared, false).notes).toBeNull();
    expect(toPlanUpdate(plan, { ...edited, scope: "ALL" }, false).notes).toBe(
      "Outro",
    );
  });

  it("SHOULD NOT send the notes WHEN they did not change, and still send them in a paid invoice", () => {
    const same = initialState(plan, noted);

    expect(toTransactionUpdate(noted, same, false).notes).toBeUndefined();
    expect(
      toTransactionUpdate(noted, { ...same, notes: "Novo" }, true).notes,
    ).toBe("Novo");
  });

  it("SHOULD see a change of the notes as a different state", () => {
    const same = initialState(plan, noted);

    expect(isSameState(same, { ...same, notes: "x" })).toBe(false);
  });
});
