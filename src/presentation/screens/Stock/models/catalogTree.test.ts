import { flattenActive } from "./catalogTree";

const tree = [
  {
    children: [
      {
        children: [],
        id: "fridge",
        name: "Geladeira",
        parentId: "kitchen",
        status: "ACTIVE",
      },
      {
        children: [],
        id: "old",
        name: "Velho",
        parentId: "kitchen",
        status: "ARCHIVED",
      },
    ],
    id: "kitchen",
    name: "Cozinha",
    status: "ACTIVE",
  },
  { children: [], id: "garage", name: "Garagem", status: "ARCHIVED" },
];

describe("flattenActive", () => {
  it("SHOULD list active nodes with their path, parents first", () => {
    expect(flattenActive(tree)).toEqual([
      { id: "kitchen", label: "Cozinha", parentId: undefined },
      { id: "fridge", label: "Cozinha › Geladeira", parentId: "kitchen" },
    ]);
  });

  it("SHOULD return an empty list for no nodes", () => {
    expect(flattenActive([])).toEqual([]);
  });
});
