import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { ACCOUNT_ICONS } from "@presentation/constants/accountIcons";
import { iconLabel } from "@presentation/constants/categoryIcons";

import NewAccountUIModel from "./NewAccountUIModel";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];
const account = new AccountDTO({
  balance: 0,
  icon: "bank",
  id: "a1",
  name: "Main",
  owner: "USER",
  ownerId: "user-id",
  status: "ACTIVE",
});
const model = new NewAccountUIModel({ accounts: [account], owners });

it("SHOULD expose the account icons in order with their labels", () => {
  expect(model.iconOptions).toHaveLength(10);
  expect(model.iconOptions).toEqual(
    ACCOUNT_ICONS.map((name) => ({ label: iconLabel(name), value: name })),
  );
});

it("SHOULD expose the sign options", () => {
  expect(model.signOptions).toEqual([
    { labelKey: "financial.accounts.form.positive", value: "POSITIVE" },
    { labelKey: "financial.accounts.form.negative", value: "NEGATIVE" },
  ]);
});

it("SHOULD build an owner choice per owner", () => {
  expect(model.ownerChoices.map((choice) => choice.value)).toEqual([
    "user-id",
    "family-1",
  ]);
});

it("SHOULD find an account by id and fall back to the first owner", () => {
  expect(model.account("a1")).toBe(account);
  expect(model.account("x")).toBeUndefined();
  expect(model.owner("family-1").id).toBe("family-1");
  expect(model.owner("nobody").id).toBe("user-id");
});
