import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import AccountUIModel from "./AccountUIModel";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
];

function model(balance: number, status = "ACTIVE", ownerId = "user-id") {
  return new AccountUIModel(
    new AccountDTO({
      balance,
      icon: "bank",
      id: "a1",
      name: "Checking",
      owner: "USER",
      ownerId,
      status,
    }),
    owners,
  );
}

it("SHOULD convert the decimal balance to signed cents without float drift", () => {
  expect(model(1520.75).balanceCents).toBe(152075);
  expect(model(0.1 + 0.2).balanceCents).toBe(30);
  expect(model(-12.3).balanceCents).toBe(-1230);
});

it("SHOULD show a negative balance as an expense amount and a positive one without type", () => {
  expect(model(-12.3).balanceAmount).toEqual({ type: "EXPENSE", value: 1230 });
  expect(model(12.3).balanceAmount).toEqual({ value: 1230 });
  expect(model(0).balanceAmount).toEqual({ value: 0 });
});

it("SHOULD flag archived accounts and expose the owner name", () => {
  expect(model(0, "ARCHIVED").isArchived).toBe(true);
  expect(model(0).isArchived).toBe(false);
  expect(model(0).ownerName).toBe("Alice");
  expect(model(0, "ACTIVE", "unknown").ownerName).toBe("");
});

it("SHOULD expose id, name, icon and owner id", () => {
  const account = model(0);

  expect(account.id).toBe("a1");
  expect(account.name).toBe("Checking");
  expect(account.icon).toBe("bank");
  expect(account.ownerId).toBe("user-id");
});
