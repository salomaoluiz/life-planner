import TagEntity from "@domain/entities/financial/TagEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import TagDTO from "./TagDTO";

it("SHOULD copy every field of the entity", () => {
  const entity = new TagEntity({
    id: "t1",
    name: "gasto-fixo",
    owner: OwnerType.USER,
    ownerId: "u1",
    scope: "ALL",
    scopeOwnerIds: ["u1", "f1"],
    usageCount: 4,
  });

  expect(TagDTO.fromEntity(entity)).toEqual({ ...entity });
});

it("SHOULD default the scope to PERSONAL, the owner scope AND the usage to 0", () => {
  const dto = new TagDTO({ id: "t1", name: "x", owner: "USER", ownerId: "u1" });

  expect(dto).toMatchObject({
    scope: "PERSONAL",
    scopeOwnerIds: ["u1"],
    usageCount: 0,
  });
});
