import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  ALL_FILTER,
  buildOwnerFilterOptions,
  normalizeSelection,
  PERSONAL_FILTER,
  resolveOwnerIds,
} from "./ownerFilter";

const user = new OwnerDTO({
  id: "user-id",
  name: "Test User",
  type: OwnerType.USER,
});
const family = new OwnerDTO({
  id: "family-1",
  name: "Silva",
  type: OwnerType.FAMILY,
});
const family2 = new OwnerDTO({
  id: "family-2",
  name: "Souza",
  type: OwnerType.FAMILY,
});
const owners = [family, family2, user];

it("SHOULD build All, Personal and one option per family, in that order", () => {
  expect(buildOwnerFilterOptions(owners)).toEqual([
    { labelKey: "home.filter.all", value: ALL_FILTER },
    { labelKey: "home.filter.personal", value: PERSONAL_FILTER },
    { label: "Silva", value: "family-1" },
    { label: "Souza", value: "family-2" },
  ]);
});

it("SHOULD resolve All to every owner, Personal to the user and a family to itself", () => {
  expect(resolveOwnerIds(owners, ALL_FILTER)).toEqual([
    "family-1",
    "family-2",
    "user-id",
  ]);
  expect(resolveOwnerIds(owners, PERSONAL_FILTER)).toEqual(["user-id"]);
  expect(resolveOwnerIds(owners, "family-2")).toEqual(["family-2"]);
});

it("SHOULD fall back to All WHEN the selected family is not an owner anymore", () => {
  expect(normalizeSelection(owners, "left-family")).toBe(ALL_FILTER);
  expect(
    resolveOwnerIds(owners, normalizeSelection(owners, "left-family")),
  ).toEqual(["family-1", "family-2", "user-id"]);
});

it("SHOULD keep a valid selection", () => {
  expect(normalizeSelection(owners, "family-1")).toBe("family-1");
  expect(normalizeSelection(owners, PERSONAL_FILTER)).toBe(PERSONAL_FILTER);
});
