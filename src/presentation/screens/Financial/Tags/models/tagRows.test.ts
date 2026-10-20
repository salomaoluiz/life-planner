import TagDTO from "@application/dto/financial/TagDTO";

import { buildTagRows, tagInActiveScope, tagInScope } from "./tagRows";

function tag(name: string, scopeOwnerIds: string[], scope = "PERSONAL") {
  return new TagDTO({
    id: name,
    name,
    owner: "USER",
    ownerId: "u",
    scope: scope as never,
    scopeOwnerIds,
    usageCount: 2,
  });
}

it("SHOULD sort by name ignoring case AND flag the All tags", () => {
  const rows = buildTagRows([
    tag("viagem", ["u"]),
    tag("Fixo", ["u", "f"], "ALL"),
    tag("alpha", ["u"]),
  ]);

  expect(rows.map((row) => row.name)).toEqual(["alpha", "Fixo", "viagem"]);
  expect(rows.map((row) => row.isAll)).toEqual([false, true, false]);
  expect(rows[0].usageCount).toBe(2);
});

it("SHOULD match a scope by any of the tag scopes", () => {
  expect(tagInScope(tag("a", ["u", "f"], "ALL"), "f")).toBe(true);
  expect(tagInScope(tag("a", ["u"]), "f")).toBe(false);
});

it("SHOULD skip a tag that only lives in archived families", () => {
  const archived = new Set(["f"]);

  expect(tagInActiveScope(tag("a", ["f"]), archived)).toBe(false);
  expect(tagInActiveScope(tag("a", ["u", "f"], "ALL"), archived)).toBe(true);
  expect(tagInActiveScope(tag("a", []), archived)).toBe(true);
});
