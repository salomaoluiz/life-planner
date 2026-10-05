import CategoryDTO from "@application/dto/financial/CategoryDTO";

import CategoryRowUIModel from "./CategoryRowUIModel";

function dto(id: string, iconColor = "#F59E0B") {
  return new CategoryDTO({
    icon: "food",
    iconColor,
    id,
    name: `Name ${id}`,
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
  });
}

it("SHOULD expose the sub count and children flag for a root", () => {
  const model = new CategoryRowUIModel({
    category: dto("a"),
    childCount: 2,
    depth: 0,
  });

  expect(model.subcount).toBe(2);
  expect(model.hasChildren).toBe(true);
  expect(model.id).toBe("a");
  expect(model.name).toBe("Name a");
  expect(model.icon).toBe("food");
  expect(model.ownerId).toBe("user-id");
});

it("SHOULD have no sub count below roots but keep hasChildren", () => {
  const model = new CategoryRowUIModel({
    category: dto("b"),
    childCount: 1,
    depth: 1,
  });

  expect(model.subcount).toBe(0);
  expect(model.hasChildren).toBe(true);
  expect(model.depth).toBe(1);
});

it("SHOULD normalize the legacy stored color", () => {
  const model = new CategoryRowUIModel({
    category: dto("c", "black"),
    childCount: 0,
    depth: 0,
  });

  expect(model.color).toBe("#000000");
  expect(model.hasChildren).toBe(false);
});
