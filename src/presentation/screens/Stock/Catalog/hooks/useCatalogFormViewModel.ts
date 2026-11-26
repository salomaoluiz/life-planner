import { useEffect, useMemo, useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { useCases } from "@application/useCases";
import {
  StockCatalogNameTaken,
  StockCatalogRule,
} from "@domain/entities/errors";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import {
  CATEGORY_COLORS,
  isHexColor,
} from "@presentation/constants/categoryColors";
import {
  appearanceFields,
  DEFAULT_CATALOG_COLOR,
  DEFAULT_CATALOG_ICON,
} from "@presentation/constants/stockCatalogAppearance";
import {
  flattenCatalogNodes,
  toTreeNodes,
} from "@presentation/utils/categoryTreeNodes";
import { toneSequence } from "@screens/Financial/models/categoryColorPicker";

import { CatalogNode } from "../models/catalogEntries";
import {
  findNode,
  MAX_LEVELS,
  parentOptions,
  rootColorOf,
  walk,
} from "../models/catalogParents";
import { cascadeColors, newChildTone } from "../models/catalogTone";

export type CatalogFormKind = "category" | "location";

export interface CatalogFormProps {
  categories: CatalogNode[];
  id?: string;
  kind: CatalogFormKind;
  locations: CatalogNode[];
  onAddChild: (id: string) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSaved: () => void;
  onViewItems: (id: string) => void;
  ownerId: string;
  // The owner the API creates it for: `USER` or `FAMILY`.
  ownerKind: string;
  parentId?: string;
}

export type CatalogFormVM = ReturnType<typeof useCatalogFormViewModel>;

const NO_PARENT = "";

export default useCatalogFormViewModel;

// Spec 125 FR 6-12: the create / edit form of a category or a location (fields, appearance, tones, cascade).
function useCatalogFormViewModel(props: CatalogFormProps) {
  const nodes = props.kind === "category" ? props.categories : props.locations;
  const existing = props.id ? findNode(nodes, props.id) : undefined;
  const ownerId = existing?.ownerId ?? props.ownerId;
  const [name, setName] = useState(existing?.name ?? "");
  const [parentId, setParentId] = useState(
    existing?.parentId ?? props.parentId ?? NO_PARENT,
  );
  const [financeId, setFinanceId] = useState(existing?.financeCategoryId ?? "");
  // `undefined` = follows the automatic value (the parent's icon and tone on create).
  const [colorPick, setColorPick] = useState<string | undefined>();
  const [iconPick, setIconPick] = useState<string | undefined>();
  const [applyPick, setApplyPick] = useState<boolean | undefined>();
  const [iconOpen, setIconOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");

  const parent = parentId ? findNode(nodes, parentId) : undefined;
  const rootColor = parent ? rootColorOf(nodes, parent.id) : undefined;
  const trimmed = name.trim();

  // FR 11: a new child takes the parent's icon and a tone of its root color by its sibling position.
  const automatic = useMemo(() => {
    if (existing || !parent) {
      return { icon: DEFAULT_CATALOG_ICON, tone: DEFAULT_CATALOG_COLOR };
    }

    return {
      icon: parent.icon,
      tone: newChildTone(
        rootColor ?? parent.color,
        parent.children
          .filter((child) => child.status === "ACTIVE")
          .map((child) => child.name),
        trimmed,
      ),
    };
  }, [existing, parent, rootColor, trimmed]);

  const color = colorPick ?? existing?.color ?? automatic.tone;
  const icon = iconPick ?? existing?.icon ?? automatic.icon;
  const hasDescendants =
    !!existing && Object.keys(cascadeColors(color, existing)).length > 0;
  const appearanceChanged =
    !!existing && (color !== existing.color || icon !== existing.icon);
  const applyToChildren = applyPick ?? (hasDescendants && appearanceChanged);

  const financeCategories = useQuery<CategoryDTO[]>({
    cacheKey: [
      useCases.getFinancialCategoriesUseCase.uniqueName,
      "stock-catalog",
      ownerId,
    ],
    enabled: props.kind === "category" && !!ownerId,
    fetch: async () =>
      useCases.getFinancialCategoriesUseCase.execute([ownerId]),
  });
  const financeOptions = (financeCategories.data ?? [])
    .filter(
      (category) => category.type === "EXPENSE" && category.status === "ACTIVE",
    )
    .map((category) => ({ label: category.name, value: category.id }));
  const inheritedFinance =
    parent?.financeCategoryId ?? parent?.effectiveFinanceCategoryId;

  const save = useMutation({
    cacheKey: [useCases.updateStockCategoryUseCase.uniqueName, "catalog-form"],
    fetch: async (run: () => Promise<void>) => run(),
  });

  useEffect(() => {
    if (save.status === "success") {
      save.reset();
      props.onSaved();
    }
  }, [save.status]);

  const parentChoices = parentOptions(nodes, props.kind, ownerId, existing);
  const allowedParents = new Set(parentChoices.map((choice) => choice.value));
  const parentNodes = flattenCatalogNodes(nodes).filter((node) =>
    allowedParents.has(node.id),
  );
  const financeNodes = toTreeNodes(
    (financeCategories.data ?? []).filter(
      (category) => category.type === "EXPENSE" && category.status === "ACTIVE",
    ),
  );
  const colorOptions = useMemo(() => {
    const base = CATEGORY_COLORS;
    const shades = rootColor ? toneSequence(rootColor) : [];

    return { base, shades };
  }, [rootColor]);

  function onSave() {
    if (!trimmed) {
      return;
    }

    const common = { ...appearanceFields(color, icon), name: trimmed };

    if (props.kind === "category") {
      const base = {
        ...common,
        financeCategoryId: financeId || undefined,
        parentId: parentId || undefined,
      };

      save.mutate(async () =>
        existing
          ? useCases.updateStockCategoryUseCase.execute({
              ...common,
              applyToChildren,
              childColors: applyToChildren
                ? cascadeColors(parent ? (rootColor ?? color) : color, existing)
                : undefined,
              financeCategoryId: financeId || null,
              id: existing.id,
              parentId: parentId || null,
            })
          : useCases.createStockCategoryUseCase.execute({
              ...base,
              owner: props.ownerKind,
              ownerId,
            }),
      );

      return;
    }

    save.mutate(async () =>
      existing
        ? useCases.updateStockLocationUseCase.execute({
            ...common,
            applyToChildren,
            childColors: applyToChildren
              ? cascadeColors(parent ? (rootColor ?? color) : color, existing)
              : undefined,
            id: existing.id,
            parentId: parentId || null,
          })
        : useCases.createStockLocationUseCase.execute({
            ...common,
            owner: props.ownerKind,
            ownerId,
            parentId: parentId || undefined,
          }),
    );
  }

  function onToggleArchive() {
    if (!existing) {
      return;
    }

    const status = existing.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    save.mutate(async () =>
      props.kind === "category"
        ? useCases.updateStockCategoryUseCase.execute({
            id: existing.id,
            status,
          })
        : useCases.updateStockLocationUseCase.execute({
            id: existing.id,
            status,
          }),
    );
  }

  // FR 4: a child of this row, while the maximum depth allows it (the row's own depth + 1 < the levels).
  const depth = existing
    ? (walk(nodes).find((entry) => entry.node.id === existing.id)?.depth ?? 0)
    : 0;
  const canAddChild =
    !!existing &&
    existing.status === "ACTIVE" &&
    depth + 1 < MAX_LEVELS[props.kind];

  const customError =
    customDraft && !isHexColor(customDraft) ? "invalid" : undefined;

  return {
    applyToChildren,
    canAddChild,
    colorOptions,
    customDraft,
    customError,
    customOpen,
    existing,
    financeId,
    financeNodes,
    financeOptions,
    hasDescendants,
    icon,
    iconColor: color,
    iconOpen,
    inheritedFinance,
    isArchived: existing?.status === "ARCHIVED",
    isSaving: save.isFetching,
    name,
    nameTaken: save.error instanceof StockCatalogNameTaken,
    onApplyToggle: () => setApplyPick(!applyToChildren),
    onColorChange: (value: string) => setColorPick(value),
    onCustomApply: () => {
      setColorPick(customDraft.toUpperCase());
      setCustomOpen(false);
    },
    onCustomClose: () => setCustomOpen(false),
    onCustomDraftChange: setCustomDraft,
    onCustomOpen: () => {
      setCustomDraft(color);
      setCustomOpen(true);
    },
    onFinanceChange: setFinanceId,
    onIconChange: (value: string) => setIconPick(value),
    onIconClose: () => setIconOpen(false),
    onIconOpen: () => setIconOpen(true),
    onNameChange: setName,
    onParentChange: (value: string) => setParentId(value),
    onSave,
    onToggleArchive,
    ownerId,
    parent,
    parentChoices,
    parentId,
    parentNodes,
    ruleError: save.error instanceof StockCatalogRule,
  };
}
