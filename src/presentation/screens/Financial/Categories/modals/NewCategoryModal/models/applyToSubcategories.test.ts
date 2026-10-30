import CategoryDTO from "@application/dto/financial/CategoryDTO";

import { buildApplyModel, descendantsOf } from "./applyToSubcategories";

function cat(
  id: string,
  name: string,
  parentId?: string,
  status: "ACTIVE" | "ARCHIVED" = "ACTIVE",
) {
  return new CategoryDTO({
    icon: "folder",
    iconColor: "#6366F1",
    id,
    name,
    owner: "USER",
    ownerId: "user-id",
    parentId,
    status,
    type: "EXPENSE",
  });
}

// Alimentação > (Mercado, Padaria[archived], Restaurante > (Delivery, Lanches)), plus an unrelated tree.
const tree = [
  cat("root", "Alimentação"),
  cat("padaria", "Padaria", "root", "ARCHIVED"),
  cat("restaurante", "Restaurante", "root"),
  cat("mercado", "Mercado", "root"),
  cat("lanches", "Lanches", "restaurante"),
  cat("delivery", "Delivery", "restaurante"),
  cat("other", "Outros"),
  cat("other-child", "Filho", "other"),
];
const before = { icon: "folder", iconColor: "#F97316" };

function build(overrides: Record<string, unknown> = {}) {
  return buildApplyModel({
    applyColor: true,
    applyIcon: true,
    categories: tree,
    categoryId: "root",
    categoryName: "Alimentação",
    initial: before,
    next: { icon: "food", iconColor: "#3B82F6" },
    ...overrides,
  });
}

describe("descendantsOf", () => {
  it("SHOULD list children, grandchildren and archived ones in list order with their depth", () => {
    expect(
      descendantsOf("root", tree).map((d) => [d.category.id, d.depth]),
    ).toEqual([
      ["mercado", 1],
      ["padaria", 1],
      ["restaurante", 1],
      ["delivery", 2],
      ["lanches", 2],
    ]);
  });

  it("SHOULD be empty for a leaf and ignore other trees", () => {
    expect(descendantsOf("mercado", tree)).toEqual([]);
    expect(descendantsOf("other", tree).map((d) => d.category.id)).toEqual([
      "other-child",
    ]);
  });
});

describe("buildApplyModel", () => {
  it("SHOULD hide the block WHEN nothing changed or there are no descendants", () => {
    expect(build({ next: before }).visible).toBe(false);
    expect(build({ categoryId: "mercado" }).visible).toBe(false);
  });

  it("SHOULD show only the Cor switch for a color change and only the Ícone switch for an icon change", () => {
    const color = build({ next: { icon: "folder", iconColor: "#3B82F6" } });
    const icon = build({ next: { icon: "food", iconColor: "#F97316" } });

    expect([color.colorSwitchVisible, color.iconSwitchVisible]).toEqual([
      true,
      false,
    ]);
    expect([icon.colorSwitchVisible, icon.iconSwitchVisible]).toEqual([
      false,
      true,
    ]);
  });

  it("SHOULD count every descendant, archived and grandchildren included", () => {
    expect(build().count).toBe(5);
  });

  it("SHOULD recolor the subtree with tones (groups share a tone) and copy the icon to every descendant", () => {
    const model = build();
    const byId = new Map(model.descendants.map((item) => [item.id, item]));

    expect(model.descendants).toHaveLength(5);
    expect(byId.get("mercado")?.iconColor).toBe(
      byId.get("restaurante")?.iconColor,
    );
    expect(byId.get("padaria")?.iconColor).toBe(byId.get("mercado")?.iconColor);
    expect(byId.get("delivery")?.iconColor).toBe(
      byId.get("lanches")?.iconColor,
    );
    expect(byId.get("delivery")?.iconColor).not.toBe(
      byId.get("mercado")?.iconColor,
    );
    expect(model.descendants.every((item) => item.icon === "food")).toBe(true);
    expect(byId.has("other-child")).toBe(false);
  });

  it("SHOULD number the tones in the preview and mark the archived rows", () => {
    const preview = build().preview;

    expect(preview[0]).toMatchObject({
      depth: 0,
      icon: "food",
      name: "Alimentação",
    });
    expect(preview.find((r) => r.id === "mercado")?.tone).toBe(1);
    expect(preview.find((r) => r.id === "delivery")?.tone).toBe(2);
    expect(preview.find((r) => r.id === "padaria")?.archived).toBe(true);
  });

  it("SHOULD send nothing for a switch that is off or whose field was reverted", () => {
    const off = build({ applyColor: false, applyIcon: false });

    expect(off.descendants).toEqual([]);
    expect(off.effectiveColor).toBe(false);
    expect(off.preview.find((r) => r.id === "mercado")).toMatchObject({
      icon: "folder",
      tint: "#6366F1",
    });

    const reverted = build({ next: { icon: "food", iconColor: "#F97316" } });

    expect(reverted.effectiveColor).toBe(false);
    expect(
      reverted.descendants.every((item) => item.iconColor === undefined),
    ).toBe(true);
  });

  it("SHOULD use the new color as the base for a subcategory subtree and leave siblings and ancestors alone", () => {
    const model = build({
      categoryId: "restaurante",
      categoryName: "Restaurante",
    });

    expect(model.count).toBe(2);
    expect(model.descendants.map((item) => item.id).sort()).toEqual([
      "delivery",
      "lanches",
    ]);
  });

  it("SHOULD skip descendants that already have the target icon and color", () => {
    const same = tree.map((c) =>
      c.id === "mercado" ? new CategoryDTO({ ...c, icon: "food" }) : c,
    );
    const model = build({
      applyColor: false,
      categories: same,
    });

    expect(
      model.descendants.find((item) => item.id === "mercado"),
    ).toBeUndefined();
    expect(model.descendants).toHaveLength(4);
  });
});
