import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import SplitEntity from "@domain/entities/financial/SplitEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  applyToAdjustment,
  applyToPart,
  createInitialState,
  isSameState,
  isValid,
  netOutflowCents,
  netType,
  newPart,
  remainingCents,
  SplitFormState,
  stateFromSplit,
  stateFromTransaction,
  toCreateParams,
  totalCents,
  toUpdateParams,
  validate,
} from "./splitFormState";

function expense(cents: number, categoryId = "cat") {
  return newPart("EXPENSE", { categoryId, cents });
}
function stateWith(
  parts: ReturnType<typeof newPart>[],
  overrides: Partial<SplitFormState> = {},
): SplitFormState {
  return {
    ...createInitialState(new Date("2026-11-15T12:00:00.000Z"), {
      accountId: "acc-1",
      description: "Mercado",
    }),
    parts,
    ...overrides,
  };
}

describe("net total", () => {
  it("SHOULD sum a negative adjustment as a discount (12000 + 5000 - 440 = 16560)", () => {
    const parts = [
      expense(12000),
      expense(5000),
      newPart("EXPENSE", { adjustment: true, cents: -440 }),
    ];

    expect(totalCents(parts)).toBe(16560);
    expect(netType(parts)).toBe("EXPENSE");
  });

  it("SHOULD be a net income for a paycheck (950000 - 90885 - 102040 - 32000)", () => {
    const parts = [
      newPart("INCOME", { categoryId: "salary", cents: 950000 }),
      expense(90885),
      expense(102040),
      expense(32000),
    ];

    expect(netOutflowCents(parts)).toBe(-725075);
    expect(totalCents(parts)).toBe(725075);
    expect(netType(parts)).toBe("INCOME");
  });
});

describe("remaining banner (FR 42)", () => {
  it("SHOULD be 0 without a typed total", () => {
    expect(remainingCents(stateWith([expense(100), expense(200)]))).toBe(0);
  });

  it("SHOULD be positive WHEN the parts are below the typed total AND negative above it", () => {
    const parts = [expense(12000), expense(5000)];

    expect(remainingCents(stateWith(parts, { totalPaidCents: 28000 }))).toBe(
      11000,
    );
    expect(remainingCents(stateWith(parts, { totalPaidCents: 10000 }))).toBe(
      -7000,
    );
  });

  it("SHOULD post the difference into ONE adjustment part: +440 over the typed total becomes a -440 discount", () => {
    const state = stateWith([expense(28440)], { totalPaidCents: 28000 });
    const next = applyToAdjustment(state);
    const adjustments = next.parts.filter((part) => part.adjustment);

    expect(adjustments).toHaveLength(1);
    expect(adjustments[0].cents).toBe(-440);
    expect(remainingCents(next)).toBe(0);
  });

  it("SHOULD update the adjustment already there AND drop it when it reaches zero", () => {
    const withAdjustment = applyToAdjustment(
      stateWith([expense(28000), expense(440)], { totalPaidCents: 28000 }),
    );
    const bigger = applyToAdjustment({
      ...withAdjustment,
      totalPaidCents: 27500,
    });

    expect(bigger.parts.filter((part) => part.adjustment)[0].cents).toBe(-940);

    const back = applyToAdjustment({ ...bigger, totalPaidCents: 28440 });

    expect(back.parts.some((part) => part.adjustment)).toBe(false);
  });

  it("SHOULD change nothing WHEN there is no difference", () => {
    const state = stateWith([expense(100), expense(200)]);

    expect(applyToAdjustment(state)).toBe(state);
  });

  it("SHOULD put the difference into the chosen part", () => {
    const state = stateWith([expense(12000), expense(5000)], {
      totalPaidCents: 28000,
    });
    const target = state.parts[1].key;
    const next = applyToPart(state, target);

    expect(next.parts[1].cents).toBe(16000);
    expect(remainingCents(next)).toBe(0);
    expect(next.parts[0].cents).toBe(12000);
  });

  it("SHOULD take from an income part WHEN the net is an income", () => {
    const parts = [
      newPart("INCOME", { categoryId: "s", cents: 1000 }),
      expense(100),
    ];
    const state = stateWith(parts, { totalPaidCents: 800 });
    const next = applyToPart(state, parts[0].key);

    expect(next.parts[0].cents).toBe(900);
    expect(remainingCents(next)).toBe(0);
  });
});

describe("validate", () => {
  it("SHOULD accept a complete split", () => {
    const state = stateWith([expense(100), expense(200)]);

    expect(isValid(validate(state, { isEditing: false }))).toBe(true);
  });

  it("SHOULD require a description, a source, two parts (one WHEN editing) and a category per part", () => {
    const errors = validate(
      stateWith([newPart("EXPENSE", { cents: 100 })], {
        accountId: undefined,
        description: " ",
      }),
      { isEditing: false },
    );

    expect(errors.description).toBeDefined();
    expect(errors.source).toBeDefined();
    expect(errors.parts).toBe("financial.split.errors.tooFew");
    expect(Object.values(errors.partCategory ?? {})).toHaveLength(1);
    expect(
      validate(stateWith([expense(1)]), { isEditing: true }).parts,
    ).toBeUndefined();
  });

  it("SHOULD refuse more than 50 parts, a zero value AND an adjustment of zero", () => {
    const many = Array.from({ length: 51 }, () => expense(1));

    expect(validate(stateWith(many), { isEditing: false }).parts).toBe(
      "financial.split.errors.tooMany",
    );
    const errors = validate(
      stateWith([
        expense(0),
        newPart("EXPENSE", { adjustment: true, cents: 0 }),
      ]),
      { isEditing: false },
    );

    expect(Object.keys(errors.partValue ?? {})).toHaveLength(2);
  });

  it("SHOULD block saving WHEN the parts do not match the total paid, AND WHEN the net is zero", () => {
    expect(
      validate(
        stateWith([expense(100), expense(200)], { totalPaidCents: 400 }),
        {
          isEditing: false,
        },
      ).total,
    ).toBe("financial.split.errors.mismatch");
    expect(
      validate(
        stateWith([
          newPart("INCOME", { categoryId: "s", cents: 100 }),
          expense(100),
        ]),
        { isEditing: false },
      ).total,
    ).toBe("financial.split.errors.totalZero");
  });

  it("SHOULD refuse an income part on a card", () => {
    const errors = validate(
      stateWith(
        [expense(100), newPart("INCOME", { categoryId: "s", cents: 50 })],
        {
          accountId: undefined,
          creditCardId: "card-1",
        },
      ),
      { isEditing: false },
    );

    expect(Object.values(errors.partValue ?? {})).toEqual([
      "financial.split.cardExpenseOnly",
    ]);
  });
});

describe("request params", () => {
  const parts = [
    { ...expense(12000, "cat-1"), id: "p1" },
    { ...expense(5000, "cat-2"), description: " Detergente ", tags: ["casa"] },
    newPart("EXPENSE", { adjustment: true, cents: -440 }),
  ];

  it("SHOULD send decimal values, the adjustment by system key AND an empty description as null", () => {
    const params = toCreateParams(
      stateWith(parts, { notes: " Compra ", totalPaidCents: 16560 }),
      "row-1",
    );

    expect(params).toEqual(
      expect.objectContaining({
        accountId: "acc-1",
        description: "Mercado",
        fromTransactionId: "row-1",
        notes: "Compra",
        paid: true,
        total: "165.60",
      }),
    );
    expect(params.parts).toEqual([
      expect.objectContaining({
        categoryId: "cat-1",
        description: null,
        id: "p1",
        value: "120.00",
      }),
      expect.objectContaining({
        description: "Detergente",
        tags: ["casa"],
        value: "50.00",
      }),
      expect.objectContaining({
        categoryId: undefined,
        systemKey: "SPLIT_ADJUSTMENT",
        value: "-4.40",
      }),
    ]);
  });

  it("SHOULD not send paid or an invoice for an account, AND not send paid for a card", () => {
    const card = toUpdateParams(
      stateWith(parts, {
        accountId: undefined,
        creditCardId: "card-1",
        invoiceMonth: "2026-12",
      }),
      "split-1",
    );

    expect(card).toEqual(
      expect.objectContaining({
        id: "split-1",
        invoiceMonth: "2026-12",
        paid: undefined,
      }),
    );
    expect(
      toUpdateParams(stateWith(parts, { invoiceMonth: "2026-12" }), "s")
        .invoiceMonth,
    ).toBeUndefined();
  });

  it("SHOULD send an empty note as null on update AND as absent on create", () => {
    expect(toUpdateParams(stateWith(parts), "s").notes).toBeNull();
    expect(toCreateParams(stateWith(parts)).notes).toBeUndefined();
  });
});

describe("state from the server", () => {
  const row = new TransactionEntityFixture().withDefault().build();

  it("SHOULD read the parts in order with the inherited description empty AND the adjustment signed", () => {
    const split = new SplitEntity({
      accountId: "acc-1",
      date: "2026-11-15T00:00:00.000Z",
      description: "Mercado",
      id: "split-1",
      owner: OwnerType.USER,
      ownerId: "user-1",
      paid: false,
      total: "165.60",
      type: TransactionType.EXPENSE,
    });
    const state = stateFromSplit({
      parts: [
        {
          ...row,
          description: "Detergente",
          descriptionInherited: false,
          id: "b",
          splitPosition: 1,
          type: TransactionType.EXPENSE,
          value: "50.00",
        },
        {
          ...row,
          descriptionInherited: true,
          id: "a",
          splitPosition: 0,
          type: TransactionType.EXPENSE,
          value: "120.00",
        },
        {
          ...row,
          descriptionInherited: true,
          id: "c",
          splitPosition: 2,
          systemKey: "SPLIT_ADJUSTMENT",
          type: TransactionType.EXPENSE,
          value: "-4.40",
        },
      ],
      split,
    });

    expect(state.parts.map((part) => part.id)).toEqual(["a", "b", "c"]);
    expect(state.parts.map((part) => part.description)).toEqual([
      "",
      "Detergente",
      "",
    ]);
    expect(state.parts[2]).toEqual(
      expect.objectContaining({ adjustment: true, cents: -440 }),
    );
    expect(state.paid).toBe(false);
  });

  it("SHOULD turn a saved transaction into the first part AND ask for the other", () => {
    const state = stateFromTransaction(row);

    expect(state.parts).toHaveLength(2);
    expect(state.parts[0].id).toBe(row.id);
    expect(state.parts[0].description).toBe("");
    expect(state.description).toBe(row.description);
    expect(state.totalPaidCents).toBeGreaterThan(0);
  });

  it("SHOULD tell two states apart WITHOUT looking at the part keys", () => {
    const a = stateWith([expense(1), expense(2)]);
    const b = {
      ...a,
      parts: a.parts.map((part) => ({ ...part, key: `${part.key}-x` })),
    };

    expect(isSameState(a, b)).toBe(true);
    expect(isSameState(a, { ...a, description: "Outro" })).toBe(false);
  });
});
