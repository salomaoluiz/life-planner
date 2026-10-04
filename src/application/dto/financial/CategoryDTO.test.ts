import CategoryEntity, {
  CategoryType,
} from "@domain/entities/financial/CategoryEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import CategoryDTO from "./CategoryDTO";

it("SHOULD map entity to CategoryDTO correctly", () => {
  const entity = new CategoryEntity({
    depthLevel: 1,
    icon: "icon",
    iconColor: "black",
    id: "id",
    name: "name",
    owner: OwnerType.USER,
    ownerId: "ownerId",
    parentId: "parentId",
    type: CategoryType.EXPENSE,
  });

  const dto = CategoryDTO.fromEntity(entity);

  expect(dto.depthLevel).toBe(1);
  expect(dto.icon).toBe("icon");
  expect(dto.iconColor).toBe("black");
  expect(dto.id).toBe("id");
  expect(dto.name).toBe("name");
  expect(dto.owner).toBe("USER");
  expect(dto.ownerId).toBe("ownerId");
  expect(dto.parentId).toBe("parentId");
  expect(dto.type).toBe("EXPENSE");
});
