import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { subtreeColors } from "@screens/Financial/models/categoryColorPicker";

interface Appearance {
  icon: string;
  iconColor: string;
}

interface ApplyInput {
  applyColor: boolean;
  applyIcon: boolean;
  categories: CategoryDTO[];
  categoryId: string;
  categoryName: string;
  initial: Appearance;
  next: Appearance;
}

interface ApplyModel {
  colorSwitchVisible: boolean;
  count: number;
  descendants: { icon?: string; iconColor?: string; id: string }[];
  effectiveColor: boolean;
  effectiveIcon: boolean;
  iconSwitchVisible: boolean;
  preview: ApplyPreviewRow[];
  visible: boolean;
}

interface ApplyPreviewRow {
  archived: boolean;
  depth: number;
  icon: string;
  id: string;
  name: string;
  tint: string;
  // 1-based tone number of a recolored descendant (the same color gets the same number).
  tone?: number;
}

interface Descendant {
  category: CategoryDTO;
  depth: number;
}

function buildApplyModel(input: ApplyInput): ApplyModel {
  const descendants = descendantsOf(input.categoryId, input.categories);
  const colorChanged = !sameColor(
    input.next.iconColor,
    input.initial.iconColor,
  );
  const iconChanged = input.next.icon !== input.initial.icon;
  const effectiveColor = input.applyColor && colorChanged;
  const effectiveIcon = input.applyIcon && iconChanged;
  const colors = effectiveColor
    ? subtreeColors(
        input.categoryId,
        input.next.iconColor,
        input.categories.map((category) => ({
          iconColor: category.iconColor,
          id: category.id,
          name: category.name,
          parentId: category.parentId,
          status: category.status,
        })),
      )
    : new Map<string, string>();
  const toneNumbers = new Map<string, number>();
  const payload: ApplyModel["descendants"] = [];
  const preview: ApplyPreviewRow[] = [
    {
      archived: false,
      depth: 0,
      icon: input.next.icon,
      id: input.categoryId,
      name: input.categoryName,
      tint: input.next.iconColor,
    },
  ];

  for (const { category, depth } of descendants) {
    const color = colors.get(category.id) ?? category.iconColor;
    const icon = effectiveIcon ? input.next.icon : category.icon;
    const item: ApplyModel["descendants"][number] = { id: category.id };
    let tone: number | undefined;

    if (effectiveColor) {
      const key = color.toLowerCase();

      if (!toneNumbers.has(key)) {
        toneNumbers.set(key, toneNumbers.size + 1);
      }
      tone = toneNumbers.get(key);
      if (!sameColor(color, category.iconColor)) {
        item.iconColor = color;
      }
    }
    if (effectiveIcon && icon !== category.icon) {
      item.icon = icon;
    }
    if (item.icon !== undefined || item.iconColor !== undefined) {
      payload.push(item);
    }
    preview.push({
      archived: category.status === "ARCHIVED",
      depth,
      icon,
      id: category.id,
      name: category.name,
      tint: color,
      tone,
    });
  }

  return {
    colorSwitchVisible: colorChanged,
    count: descendants.length,
    descendants: payload,
    effectiveColor,
    effectiveIcon,
    iconSwitchVisible: iconChanged,
    preview,
    visible: descendants.length > 0 && (colorChanged || iconChanged),
  };
}

// Spec 058 FR 3 / 4: every descendant (archived included) in the order the Categories list shows: name order inside
// each level, a parent before its children.
function descendantsOf(id: string, categories: CategoryDTO[]): Descendant[] {
  const byParent = new Map<string, CategoryDTO[]>();

  for (const category of categories) {
    if (category.parentId) {
      byParent.set(category.parentId, [
        ...(byParent.get(category.parentId) ?? []),
        category,
      ]);
    }
  }
  const result: Descendant[] = [];
  const seen = new Set<string>([id]);

  function visit(parentId: string, depth: number) {
    const children = [...(byParent.get(parentId) ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const child of children) {
      if (!seen.has(child.id)) {
        seen.add(child.id);
        result.push({ category: child, depth });
        visit(child.id, depth + 1);
      }
    }
  }

  visit(id, 1);

  return result;
}

function sameColor(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

export type { ApplyInput, ApplyModel, ApplyPreviewRow };
export { buildApplyModel, descendantsOf };
