import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { MAX_TRANSACTION_CENTS } from "@utils/money";

import {
  CardFormState,
  createInitialState,
  isPaymentAfterDue,
  isSameState,
  paymentAccountOptions,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "./cardFormState";

const owner = { id: "user-id", name: "Me", type: "USER" } as OwnerDTO;
const family = { id: "fam-id", name: "Fam", type: "FAMILY" } as OwnerDTO;

const dto = new CreditCardDTO({
  brand: "VISA",
  closingDay: 31,
  color: "#6366F1",
  dueDay: 10,
  id: "card-id",
  lastDigits: "1234",
  limit: 500000,
  owner: "USER",
  ownerId: "user-id",
  paymentDay: 5,
  status: "ACTIVE",
  title: "Main card",
});

function valid(overrides: Partial<CardFormState> = {}): CardFormState {
  return {
    ...createInitialState({ ownerId: "user-id" }),
    closingDay: "5",
    dueDay: "8",
    limitCents: 100000,
    title: "Card",
    ...overrides,
  };
}

describe("createInitialState / stateFromDto / isSameState", () => {
  it("SHOULD start with VISA, the first color AND empty days", () => {
    expect(createInitialState({ ownerId: "o" })).toEqual({
      brand: "VISA",
      closingDay: "",
      dueDay: "",
      isArchived: false,
      lastDigits: "",
      limitCents: 0,
      ownerId: "o",
      paymentAccountId: "",
      paymentDay: "",
      tint: "#6366F1",
      title: "",
    });
  });

  it("SHOULD map a DTO (days to strings, absent optionals to empty)", () => {
    expect(stateFromDto(dto)).toMatchObject({
      closingDay: "31",
      dueDay: "10",
      isArchived: false,
      lastDigits: "1234",
      limitCents: 500000,
      paymentDay: "5",
      tint: "#6366F1",
    });
    expect(
      stateFromDto(
        new CreditCardDTO({
          ...dto,
          lastDigits: undefined,
          paymentDay: undefined,
          status: "ARCHIVED",
        }),
      ),
    ).toMatchObject({ isArchived: true, lastDigits: "", paymentDay: "" });
  });

  it("SHOULD compare every field", () => {
    expect(isSameState(valid(), valid())).toBe(true);
    expect(isSameState(valid(), valid({ title: "Other" }))).toBe(false);
    expect(isSameState(valid(), valid({ paymentDay: "9" }))).toBe(false);
  });
});

describe("validate", () => {
  it("SHOULD accept a valid state", () => {
    expect(validate(valid())).toEqual({});
  });

  it("SHOULD require title (and cap it at 60)", () => {
    expect(validate(valid({ title: "   " })).title).toBe(
      "financial.cardForm.errors.titleRequired",
    );
    expect(validate(valid({ title: "x".repeat(61) })).title).toBe(
      "financial.cardForm.errors.titleTooLong",
    );
  });

  it("SHOULD require a positive limit within the int4 range", () => {
    expect(validate(valid({ limitCents: 0 })).limit).toBe(
      "financial.cardForm.errors.limitRequired",
    );
    expect(
      validate(valid({ limitCents: MAX_TRANSACTION_CENTS + 1 })).limit,
    ).toBe("financial.cardForm.errors.limitTooLarge");
  });

  it("SHOULD accept empty last digits but reject anything but 4 digits", () => {
    expect(validate(valid({ lastDigits: "" })).lastDigits).toBeUndefined();
    expect(validate(valid({ lastDigits: "12a4" })).lastDigits).toBe(
      "financial.cardForm.errors.lastDigitsInvalid",
    );
    expect(validate(valid({ lastDigits: "123" })).lastDigits).toBe(
      "financial.cardForm.errors.lastDigitsInvalid",
    );
  });

  it("SHOULD require closing and due days", () => {
    const errors = validate(valid({ closingDay: "", dueDay: "" }));

    expect(errors.closingDay).toBe("financial.cardForm.errors.dayRequired");
    expect(errors.dueDay).toBe("financial.cardForm.errors.dayRequired");
  });
});

describe("isPaymentAfterDue", () => {
  it.each([
    ["closing 5 / due 15 / payment 20", "5", "15", "20", true],
    ["closing 31 / due 10 / payment 5", "31", "10", "5", false],
    ["payment empty uses the due day", "5", "15", "", false],
    ["both next month, payment 6 > due 5", "10", "5", "6", true],
    ["payment in this month, due in the next", "5", "3", "20", false],
    ["missing days never warn", "", "", "", false],
  ])("SHOULD handle %s", (_label, closing, due, payment, expected) => {
    expect(
      isPaymentAfterDue(
        valid({ closingDay: closing, dueDay: due, paymentDay: payment }),
      ),
    ).toBe(expected);
  });
});

describe("toCreateParams", () => {
  it("SHOULD trim, parse days and drop empty optionals", () => {
    expect(toCreateParams(valid({ title: "  Card  " }), owner)).toEqual({
      brand: "VISA",
      closingDay: 5,
      color: "#6366F1",
      dueDay: 8,
      lastDigits: undefined,
      limit: 100000,
      owner: "USER",
      ownerId: "user-id",
      paymentDay: undefined,
      title: "Card",
    });
  });

  it("SHOULD keep the optionals WHEN filled", () => {
    expect(
      toCreateParams(valid({ lastDigits: "9876", paymentDay: "7" }), family),
    ).toMatchObject({
      lastDigits: "9876",
      owner: "FAMILY",
      ownerId: "fam-id",
      paymentDay: 7,
    });
  });
});

describe("toUpdateParams", () => {
  const initial = stateFromDto(dto);

  it("SHOULD return only the id WHEN nothing changed", () => {
    expect(toUpdateParams("card-id", initial, initial, owner)).toEqual({
      id: "card-id",
    });
  });

  it("SHOULD send only the changed fields", () => {
    expect(
      toUpdateParams(
        "card-id",
        { ...initial, limitCents: 1, title: " New " },
        initial,
        owner,
      ),
    ).toEqual({ id: "card-id", limit: 1, title: "New" });
  });

  it("SHOULD send null WHEN the optional payment day and last digits are cleared", () => {
    expect(
      toUpdateParams(
        "card-id",
        { ...initial, lastDigits: "", paymentDay: "" },
        initial,
        owner,
      ),
    ).toEqual({ id: "card-id", lastDigits: null, paymentDay: null });
  });

  it("SHOULD send owner and ownerId together WHEN the owner changed", () => {
    expect(
      toUpdateParams(
        "card-id",
        { ...initial, ownerId: "fam-id" },
        initial,
        family,
      ),
    ).toEqual({ id: "card-id", owner: "FAMILY", ownerId: "fam-id" });
  });

  it("SHOULD send the new days, brand, color and status", () => {
    expect(
      toUpdateParams(
        "card-id",
        {
          ...initial,
          brand: "ELO",
          closingDay: "1",
          dueDay: "2",
          isArchived: true,
          tint: "#EF4444",
        },
        initial,
        owner,
      ),
    ).toEqual({
      brand: "ELO",
      closingDay: 1,
      color: "#EF4444",
      dueDay: 2,
      id: "card-id",
      status: "ARCHIVED",
    });
  });
});

describe("payment account (spec 035)", () => {
  const checking = { id: "a1", name: "Checking", status: "ACTIVE" } as never;
  const old = { id: "a2", name: "Old", status: "ARCHIVED" } as never;

  it("SHOULD load the linked id, send it on create AND omit it when empty", () => {
    const linked = stateFromDto(
      new CreditCardDTO({ ...dto, paymentAccountId: "a1" }),
    );

    expect(linked.paymentAccountId).toBe("a1");
    expect(stateFromDto(dto).paymentAccountId).toBe("");
    expect(toCreateParams(valid({ paymentAccountId: "a1" }), owner)).toEqual(
      expect.objectContaining({ paymentAccountId: "a1" }),
    );
    expect(toCreateParams(valid(), owner).paymentAccountId).toBeUndefined();
  });

  it("SHOULD send null when cleared on edit AND nothing when untouched", () => {
    const initial = valid({ paymentAccountId: "a1" });

    expect(
      toUpdateParams("id", valid({ paymentAccountId: "" }), initial, owner)
        .paymentAccountId,
    ).toBeNull();
    expect(
      "paymentAccountId" in toUpdateParams("id", initial, initial, owner),
    ).toBe(false);
    expect(
      toUpdateParams("id", valid({ paymentAccountId: "a9" }), initial, owner)
        .paymentAccountId,
    ).toBe("a9");
    expect(isSameState(initial, valid())).toBe(false);
  });

  it("SHOULD offer None AND the active accounts only", () => {
    expect(paymentAccountOptions([checking, old], "")).toEqual([
      { labelKey: "financial.cardForm.paymentAccountNone", value: "" },
      { label: "Checking", value: "a1" },
    ]);
  });

  it("SHOULD keep an archived linked account (marked) AND the other-member placeholder", () => {
    expect(paymentAccountOptions([checking, old], "a2").at(-1)).toEqual({
      archived: true,
      label: "Old",
      value: "a2",
    });
    expect(paymentAccountOptions([checking], "x9").at(-1)).toEqual({
      labelKey: "financial.cardForm.paymentAccountOther",
      value: "x9",
    });
  });
});
