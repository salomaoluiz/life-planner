import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  CategoryFormState,
  changeOwner,
  changeType,
  createInitialState,
  isSameState,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "./categoryFormState";

function category(
  id: string,
  overrides: Partial<ConstructorParameters<typeof CategoryDTO>[0]> = {},
) {
  return new CategoryDTO({
    icon: "folder",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    ...overrides,
  });
}
const user = new OwnerDTO({
  id: "user-id",
  name: "Alice",
  type: OwnerType.USER,
});
const base: CategoryFormState = {
  icon: "folder",
  iconColor: "#6366F1",
  name: "Food",
  ownerId: "user-id",
  parentId: undefined,
  type: "EXPENSE",
};

it("SHOULD start with the indigo default color, the folder icon and the expense type", () => {
  expect(createInitialState({ ownerId: "user-id" })).toEqual({
    icon: "folder",
    iconColor: "#6366F1",
    name: "",
    ownerId: "user-id",
    parentId: undefined,
    type: "EXPENSE",
  });
});

it("SHOULD preset the type WHEN opened from the transaction form", () => {
  expect(createInitialState({ ownerId: "user-id", type: "INCOME" }).type).toBe(
    "INCOME",
  );
});

it("SHOULD keep a stored color outside the palette and map the legacy black token", () => {
  expect(stateFromDto(category("a", { iconColor: "#123456" })).iconColor).toBe(
    "#123456",
  );
  expect(stateFromDto(category("a")).iconColor).toBe("#000000");
});

it("SHOULD clear the parent WHEN the type changes to one the parent does not have", () => {
  const parent = category("p");
  const next = changeType({ ...base, parentId: "p" }, "INCOME", [parent]);

  expect(next.type).toBe("INCOME");
  expect(next.parentId).toBeUndefined();
  expect(
    changeType({ ...base, parentId: "p" }, "EXPENSE", [parent]).parentId,
  ).toBe("p");
});

it("SHOULD clear the parent WHEN the owner changes", () => {
  expect(changeOwner({ ...base, parentId: "p" }, "family-1")).toEqual({
    ...base,
    ownerId: "family-1",
    parentId: undefined,
  });
});

it("SHOULD validate the name (required, max 60)", () => {
  expect(validate({ ...base, name: "  " }).name).toBe(
    "financial.categories.nameRequired",
  );
  expect(validate({ ...base, name: "a".repeat(61) }).name).toBe(
    "financial.categories.form.errors.nameTooLong",
  );
  expect(validate({ ...base, name: "a".repeat(60) })).toEqual({});
});

it("SHOULD compare states ignoring color case", () => {
  expect(isSameState(base, { ...base, iconColor: "#6366f1" })).toBe(true);
  expect(isSameState(base, { ...base, icon: "car" })).toBe(false);
});

it("SHOULD compute depthLevel from the parent on create", () => {
  const parent = category("p", { depthLevel: 1 });

  expect(
    toCreateParams({ ...base, parentId: "p" }, user, [parent]).depthLevel,
  ).toBe(2);
  expect(toCreateParams(base, user, [parent])).toEqual({
    depthLevel: 0,
    icon: "folder",
    iconColor: "#6366F1",
    name: "Food",
    owner: "USER",
    ownerId: "user-id",
    parentId: undefined,
    type: "EXPENSE",
  });
});

it("SHOULD send only changed fields on update and never the owner", () => {
  expect(toUpdateParams("c1", { ...base, name: " Meals " }, base)).toEqual({
    id: "c1",
    name: "Meals",
  });
  expect(
    toUpdateParams("c1", { ...base, icon: "car", iconColor: "#EF4444" }, base),
  ).toEqual({ icon: "car", iconColor: "#EF4444", id: "c1" });
});

it("SHOULD send parentId null WHEN the parent is removed and the id WHEN it changes", () => {
  const withParent = { ...base, parentId: "p" };

  expect(toUpdateParams("c1", base, withParent)).toEqual({
    id: "c1",
    parentId: null,
  });
  expect(toUpdateParams("c1", { ...base, parentId: "q" }, withParent)).toEqual({
    id: "c1",
    parentId: "q",
  });
});

it("SHOULD send nothing but the id WHEN nothing changed", () => {
  expect(toUpdateParams("c1", base, base)).toEqual({ id: "c1" });
});
