import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
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
} from "./accountFormState";

const user = new OwnerDTO({
  id: "user-id",
  name: "Alice",
  type: OwnerType.USER,
});
const base: AccountFormState = {
  amountCents: 152075,
  icon: "bank",
  isArchived: false,
  isNegative: false,
  name: "Checking",
  ownerId: "user-id",
};

it("SHOULD start with the bank icon, zero positive balance, active", () => {
  expect(createInitialState({ ownerId: "user-id" })).toEqual({
    amountCents: 0,
    icon: "bank",
    isArchived: false,
    isNegative: false,
    name: "",
    ownerId: "user-id",
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
    icon: "wallet",
    isArchived: true,
    isNegative: true,
    name: "Wallet",
    ownerId: "user-id",
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
    icon: "bank",
    name: "Checking",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
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
