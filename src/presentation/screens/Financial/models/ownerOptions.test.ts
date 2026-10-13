import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  ALL_OWNERS,
  buildOwnerChoices,
  buildOwnerFilterChoices,
  personalOwnerId,
  translateChoices,
} from "./ownerOptions";

const owners = [
  new OwnerDTO({ id: "family-b", name: "Zeta Family", type: OwnerType.FAMILY }),
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({
    id: "family-a",
    name: "Alpha Family",
    type: OwnerType.FAMILY,
  }),
];

it("SHOULD list Personal first and families by name", () => {
  expect(buildOwnerChoices(owners)).toEqual([
    { labelKey: "financial.common.personal", value: "user-id" },
    { label: "Alpha Family", value: "family-a" },
    { label: "Zeta Family", value: "family-b" },
  ]);
});

it("SHOULD put All before the owner choices in the filter", () => {
  expect(buildOwnerFilterChoices(owners)[0]).toEqual({
    labelKey: "financial.common.all",
    value: ALL_OWNERS,
  });
  expect(buildOwnerFilterChoices(owners)).toHaveLength(4);
});

it("SHOULD find the personal owner id, or undefined without one", () => {
  expect(personalOwnerId(owners)).toBe("user-id");
  expect(personalOwnerId([])).toBeUndefined();
});

it("SHOULD translate labelKey choices and keep literal labels", () => {
  const translated = translateChoices(
    buildOwnerChoices(owners),
    (key) => `t:${key}`,
  );

  expect(translated[0]).toEqual({
    label: "t:financial.common.personal",
    value: "user-id",
  });
  expect(translated[1]).toEqual({ label: "Alpha Family", value: "family-a" });
});

it("SHOULD return no Personal choice WHEN the user owner is missing", () => {
  expect(buildOwnerChoices([owners[0]])).toEqual([
    { label: "Zeta Family", value: "family-b" },
  ]);
});
