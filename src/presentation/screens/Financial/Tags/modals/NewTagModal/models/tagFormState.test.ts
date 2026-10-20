import TagDTO from "@application/dto/financial/TagDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  createInitialState,
  isSameState,
  stateFromDto,
  toCreateParams,
  toUpdateParams,
  validate,
} from "./tagFormState";

const family = new OwnerDTO({ id: "f1", name: "Fam", type: OwnerType.FAMILY });

function dto(scope: string) {
  return new TagDTO({
    id: "t1",
    name: "fixo",
    owner: "USER",
    ownerId: "u1",
    scope: scope as never,
  });
}

it("SHOULD start empty on the given owner AND compare states", () => {
  const state = createInitialState("u1");

  expect(state).toEqual({ name: "", ownerId: "u1" });
  expect(isSameState(state, { ...state })).toBe(true);
  expect(isSameState(state, { ...state, name: "x" })).toBe(false);
  expect(isSameState(state, { ...state, ownerId: "ALL" })).toBe(false);
});

it("SHOULD load an All tag as the ALL owner", () => {
  expect(stateFromDto(dto("ALL"))).toEqual({ name: "fixo", ownerId: "ALL" });
  expect(stateFromDto(dto("PERSONAL"))).toEqual({
    name: "fixo",
    ownerId: "u1",
  });
});

it("SHOULD build the create params for one owner and for All", () => {
  expect(toCreateParams({ name: " x ", ownerId: "f1" }, family)).toEqual({
    name: "x",
    owner: "FAMILY",
    ownerId: "f1",
  });
  expect(toCreateParams({ name: "x", ownerId: "ALL" }, undefined)).toEqual({
    name: "x",
    owner: "ALL",
    ownerId: undefined,
  });
  expect(toCreateParams({ name: "x", ownerId: "?" }, undefined).owner).toBe("");
});

it("SHOULD send only what changed on update", () => {
  const initial = { name: "fixo", ownerId: "u1" };

  expect(toUpdateParams("t1", { ...initial }, initial)).toEqual({ id: "t1" });
  expect(toUpdateParams("t1", { ...initial, name: " novo " }, initial)).toEqual(
    {
      id: "t1",
      name: "novo",
    },
  );
  expect(toUpdateParams("t1", { ...initial, ownerId: "ALL" }, initial)).toEqual(
    {
      id: "t1",
      scope: "ALL",
    },
  );
});

it("SHOULD require a name of at most 30 characters", () => {
  expect(validate({ name: "  ", ownerId: "u1" }).name).toBe(
    "financial.tagForm.nameRequired",
  );
  expect(validate({ name: "x".repeat(31), ownerId: "u1" }).name).toBe(
    "financial.transactions.form.tagsTooLong",
  );
  expect(validate({ name: "x".repeat(30), ownerId: "u1" })).toEqual({});
});
