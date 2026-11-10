import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  AccountFormState,
  createInitialState,
  isSameState,
  signedBalance,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
  withArchived,
  withCurrency,
  withIcon,
  withType,
} from "./accountFormState";

const user = new OwnerDTO({
  id: "user-id",
  name: "Alice",
  type: OwnerType.USER,
});
const base: AccountFormState = {
  amountCents: 152075,
  currency: "BRL",
  icon: "bank",
  iconTouched: true,
  isArchived: false,
  isFavorite: false,
  isNegative: false,
  name: "Checking",
  ownerId: "user-id",
  type: AccountType.CHECKING,
};

it("SHOULD start with the bank icon, zero positive balance, active", () => {
  expect(createInitialState({ ownerId: "user-id" })).toEqual({
    amountCents: 0,
    currency: "BRL",
    icon: "bank",
    iconTouched: false,
    isArchived: false,
    isFavorite: false,
    isNegative: false,
    name: "",
    ownerId: "user-id",
    type: AccountType.CHECKING,
  });
});

it("SHOULD split a negative decimal balance into amount and sign", () => {
  const dto = new AccountDTO({
    balance: -12.3,
    icon: "wallet",
    id: "a1",
    name: "Wallet",
    owner: "USER",
    ownerId: "user-id",
    status: "ARCHIVED",
  });

  expect(stateFromDto(dto)).toEqual({
    amountCents: 1230,
    currency: "BRL",
    icon: "wallet",
    iconTouched: true,
    isArchived: true,
    isFavorite: false,
    isNegative: true,
    name: "Wallet",
    ownerId: "user-id",
    type: AccountType.CHECKING,
  });
});

it("SHOULD build the signed decimal balance and never -0", () => {
  expect(signedBalance(base)).toBe(1520.75);
  expect(signedBalance({ ...base, isNegative: true })).toBe(-1520.75);
  expect(signedBalance({ ...base, amountCents: 0, isNegative: true })).toBe(0);
  expect(
    Object.is(signedBalance({ ...base, amountCents: 0, isNegative: true }), -0),
  ).toBe(false);
});

it("SHOULD validate name and balance limits", () => {
  expect(validate({ ...base, name: " " }).name).toBe(
    "financial.accounts.nameRequired",
  );
  expect(validate({ ...base, name: "a".repeat(61) }).name).toBe(
    "financial.accounts.form.errors.nameTooLong",
  );
  expect(validate({ ...base, amountCents: 2147483648 }).amount).toBe(
    "financial.accounts.form.errors.balanceTooLarge",
  );
  expect(validate(base)).toEqual({});
});

it("SHOULD compare states by value", () => {
  expect(isSameState(base, { ...base })).toBe(true);
  expect(isSameState(base, { ...base, isNegative: true })).toBe(false);
});

it("SHOULD build create params as an ACTIVE account with a decimal balance", () => {
  expect(
    toCreateParams({ ...base, isNegative: true, name: " Checking " }, user),
  ).toEqual({
    balance: -1520.75,
    currency: "BRL",
    icon: "bank",
    name: "Checking",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
    type: "CHECKING",
  });
});

it("SHOULD send only changed fields on update and never the owner", () => {
  expect(toUpdateParams("a1", { ...base, name: "Main" }, base)).toEqual({
    id: "a1",
    name: "Main",
  });
  expect(toUpdateParams("a1", { ...base, isArchived: true }, base)).toEqual({
    id: "a1",
    status: "ARCHIVED",
  });
  expect(toUpdateParams("a1", { ...base, isNegative: true }, base)).toEqual({
    balance: -1520.75,
    id: "a1",
  });
  expect(toUpdateParams("a1", base, base)).toEqual({ id: "a1" });
});

it("SHOULD restore ACTIVE WHEN an archived account is unarchived", () => {
  expect(toUpdateParams("a1", base, { ...base, isArchived: true })).toEqual({
    id: "a1",
    status: "ACTIVE",
  });
});

it("SHOULD reject a balance change on an account that is archived AND stays archived", () => {
  const archived = { ...base, isArchived: true };

  expect(validate({ ...archived, amountCents: 100 }, archived).amount).toBe(
    "financial.errors.accountArchived",
  );
  // no balance change: fine
  expect(validate({ ...archived, name: "Renamed" }, archived)).toEqual({});
  // un-archiving in the same save: allowed (the patch goes first)
  expect(
    validate({ ...archived, amountCents: 100, isArchived: false }, archived),
  ).toEqual({});
  // archiving in the same save: allowed (the adjustment goes first)
  expect(
    validate({ ...base, amountCents: 100, isArchived: true }, base),
  ).toEqual({});
  // creating: no initial state to compare with
  expect(validate({ ...base, amountCents: 100 })).toEqual({});
});

describe("favorite account (spec 094)", () => {
  it("SHOULD read isFavorite from the account", () => {
    const dto = new AccountDTO({
      balance: 1,
      icon: "bank",
      id: "a1",
      isFavorite: true,
      name: "Main",
      owner: "USER",
      ownerId: "user-id",
      status: "ACTIVE",
    });

    expect(stateFromDto(dto).isFavorite).toBe(true);
  });

  it("SHOULD send isFavorite only WHEN it changed", () => {
    expect(toUpdateParams("a1", { ...base, isFavorite: true }, base)).toEqual({
      id: "a1",
      isFavorite: true,
    });
    expect(toUpdateParams("a1", base, { ...base, isFavorite: true })).toEqual({
      id: "a1",
      isFavorite: false,
    });
    expect(toUpdateParams("a1", base, base)).toEqual({ id: "a1" });
  });

  it("SHOULD NOT send isFavorite WHEN archiving (the API clears it)", () => {
    const favorite = { ...base, isFavorite: true };

    expect(
      toUpdateParams("a1", withArchived(favorite, true), favorite),
    ).toEqual({ id: "a1", status: "ARCHIVED" });
  });

  it("SHOULD send isFavorite on create only WHEN it is on", () => {
    expect(toCreateParams({ ...base, isFavorite: true }, user)).toHaveProperty(
      "isFavorite",
      true,
    );
    expect(toCreateParams(base, user)).not.toHaveProperty("isFavorite");
  });

  it("SHOULD turn the favorite off WHEN the account is archived", () => {
    expect(withArchived({ ...base, isFavorite: true }, true)).toEqual({
      ...base,
      isArchived: true,
      isFavorite: false,
    });
    expect(withArchived({ ...base, isArchived: true }, false)).toEqual(base);
  });
});

describe("account type (spec 101)", () => {
  const fresh = createInitialState({ ownerId: "user-id" });

  it("SHOULD read the type of the account AND treat its icon as chosen", () => {
    const dto = new AccountDTO({
      balance: 1,
      icon: "bank",
      id: "a1",
      name: "Broker",
      owner: "USER",
      ownerId: "user-id",
      status: "ACTIVE",
      type: AccountType.BROKERAGE,
    });

    expect(stateFromDto(dto)).toMatchObject({
      iconTouched: true,
      type: AccountType.BROKERAGE,
    });
  });

  it("SHOULD suggest the icon of the type while the icon was not picked by hand", () => {
    expect(withType(fresh, AccountType.SAVINGS)).toMatchObject({
      icon: "piggy-bank",
      type: AccountType.SAVINGS,
    });
    expect(withType(fresh, AccountType.BROKERAGE).icon).toBe("chart-line");
    expect(withType(fresh, AccountType.CASH).icon).toBe("cash");
    expect(withType(fresh, AccountType.OTHER).icon).toBe("wallet");
    expect(withType(fresh, AccountType.CHECKING).icon).toBe("bank");
  });

  it("SHOULD keep an icon picked by hand when the type changes, even if it equals the default", () => {
    const picked = withIcon(fresh, "safe");

    expect(picked.iconTouched).toBe(true);
    expect(withType(picked, AccountType.CASH)).toMatchObject({
      icon: "safe",
      type: AccountType.CASH,
    });
    expect(withType(withIcon(fresh, "bank"), AccountType.CASH).icon).toBe(
      "bank",
    );
  });

  it("SHOULD NOT change the icon when editing an existing account", () => {
    expect(withType(base, AccountType.SAVINGS).icon).toBe("bank");
  });

  it("SHOULD send a type-only change on update AND nothing when it did not change", () => {
    expect(
      toUpdateParams("a1", { ...base, type: AccountType.SAVINGS }, base),
    ).toEqual({ id: "a1", type: AccountType.SAVINGS });
    expect(toUpdateParams("a1", base, base)).toEqual({ id: "a1" });
  });

  it("SHOULD send the type on create", () => {
    expect(
      toCreateParams(withType(fresh, AccountType.BROKERAGE), user),
    ).toMatchObject({ icon: "chart-line", type: "BROKERAGE" });
  });

  it("SHOULD compare the type but not whether the icon was picked", () => {
    expect(isSameState(base, { ...base, type: AccountType.CASH })).toBe(false);
    expect(isSameState(base, { ...base, iconTouched: false })).toBe(true);
  });
});

it("SHOULD send the chosen currency on create AND never on update (spec 103)", () => {
  const usd = withCurrency(base, "USD");

  expect(toCreateParams(usd, user).currency).toBe("USD");
  expect(isSameState(base, usd)).toBe(false);
  expect(toUpdateParams("a1", usd, base)).toEqual({ id: "a1" });
  expect(
    stateFromDto(
      new AccountDTO({
        balance: 0,
        currency: "EUR",
        icon: "bank",
        id: "a1",
        name: "Euro",
        owner: "USER",
        ownerId: "user-id",
        status: "ACTIVE",
      }),
    ).currency,
  ).toBe("EUR");
});
