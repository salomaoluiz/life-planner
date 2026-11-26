import { act, renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { useCases } from "@application/useCases";
import {
  StockCatalogNameTaken,
  StockCatalogRule,
} from "@domain/entities/errors";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { toneSequence } from "@screens/Financial/models/categoryColorPicker";

import { CatalogNode } from "../models/catalogEntries";
import useCatalogFormViewModel, {
  CatalogFormProps,
} from "./useCatalogFormViewModel";

jest.mock("@infrastructure/fetcher", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockCategoryUseCase: { execute: jest.fn(), uniqueName: "c1" },
    createStockLocationUseCase: { execute: jest.fn(), uniqueName: "c2" },
    getFinancialCategoriesUseCase: { execute: jest.fn(), uniqueName: "fin" },
    updateStockCategoryUseCase: { execute: jest.fn(), uniqueName: "u1" },
    updateStockLocationUseCase: { execute: jest.fn(), uniqueName: "u2" },
  },
}));

function node(
  id: string,
  name: string,
  extra: Partial<CatalogNode> = {},
): CatalogNode {
  return {
    children: [],
    color: "#3B82F6",
    icon: "cup",
    itemCount: 1,
    name,
    owner: "USER",
    ownerId: "u",
    status: "ACTIVE",
    ...extra,
    id,
  };
}

const child = node("child", "Cheese", { parentId: "dairy" });
const dairy = node("dairy", "Dairy", {
  children: [child],
  financeCategoryId: "fin-1",
});
const pantry = node("pantry", "Pantry", { icon: "archive" });
const save = new UseMutationFixture<unknown, void>();
const finance = new UseQueryFixture<CategoryDTO[]>();

function props(extra: Partial<CatalogFormProps> = {}): CatalogFormProps {
  return {
    categories: [dairy, node("meat", "Meat")],
    kind: "category",
    locations: [pantry],
    onAddChild: jest.fn(),
    onClose: jest.fn(),
    onDelete: jest.fn(),
    onSaved: jest.fn(),
    onViewItems: jest.fn(),
    ownerId: "u",
    ownerKind: "USER",
    ...extra,
  };
}

async function runSave() {
  const run = (save.value.mutate as jest.Mock).mock
    .calls[0][0] as () => Promise<void>;

  await run();
}

function setup(extra: Partial<CatalogFormProps> = {}) {
  const value = props(extra);

  return { props: value, ...renderHook(() => useCatalogFormViewModel(value)) };
}

beforeEach(() => {
  jest.clearAllMocks();
  save.reset();
  finance.reset();
  jest.mocked(useMutation).mockImplementation((() => save.build()) as never);
  jest.mocked(useQuery).mockImplementation((() => finance.build()) as never);
});

describe("create", () => {
  it("SHOULD start empty with the neutral appearance AND not save without a name", () => {
    const { result } = setup();

    expect(result.current.name).toBe("");
    expect(result.current.iconColor).toBe("#8A8F98");
    expect(result.current.icon).toBe("package-variant");

    act(() => result.current.onSave());
    expect(save.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD create a category with the typed values", async () => {
    const { result } = setup();

    act(() => result.current.onNameChange("  Grãos "));
    act(() => result.current.onColorChange("#112233"));
    act(() => result.current.onIconChange("leaf"));
    act(() => result.current.onFinanceChange("fin-2"));
    act(() => result.current.onSave());
    await runSave();

    expect(useCases.createStockCategoryUseCase.execute).toHaveBeenCalledWith({
      color: "#112233",
      financeCategoryId: "fin-2",
      icon: "leaf",
      name: "Grãos",
      owner: "USER",
      ownerId: "u",
      parentId: undefined,
    });
  });

  it("SHOULD give a new child the parent's icon and a tone of the root by sibling position", () => {
    const { result } = setup({ parentId: "dairy" });
    const tones = toneSequence("#3B82F6");

    expect(result.current.icon).toBe("cup");
    // "Cheese" is the only sibling: a child named after it comes second alphabetically
    act(() => result.current.onNameChange("Butter"));
    expect(result.current.iconColor).toBe(tones[0]);
    act(() => result.current.onNameChange("Yogurt"));
    expect(result.current.iconColor).toBe(tones[1]);

    // a manual pick wins over the automatic tone
    act(() => result.current.onColorChange("#ABCDEF"));
    expect(result.current.iconColor).toBe("#ABCDEF");
  });

  it("SHOULD create a location with its parent", async () => {
    const { result } = setup({ kind: "location", parentId: "pantry" });

    act(() => result.current.onNameChange("Shelf"));
    act(() => result.current.onSave());
    await runSave();

    expect(useCases.createStockLocationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Shelf",
        owner: "USER",
        parentId: "pantry",
      }),
    );
  });
});

describe("edit", () => {
  it("SHOULD load the row and offer the parents of the same owner outside its subtree", () => {
    const { result } = setup({ id: "dairy" });

    expect(result.current.name).toBe("Dairy");
    expect(result.current.iconColor).toBe("#3B82F6");
    expect(result.current.financeId).toBe("fin-1");
    expect(result.current.parentChoices.map((choice) => choice.value)).toEqual([
      "meat",
    ]);
    expect(result.current.hasDescendants).toBe(true);
  });

  it("SHOULD push the icon and the tones to the children WHEN the appearance of a parent changes", async () => {
    const { result } = setup({ id: "dairy" });
    const tones = toneSequence("#445566");

    expect(result.current.applyToChildren).toBe(false);

    act(() => result.current.onColorChange("#445566"));
    expect(result.current.applyToChildren).toBe(true);

    act(() => result.current.onSave());
    await runSave();

    expect(useCases.updateStockCategoryUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        applyToChildren: true,
        childColors: { child: tones[0] },
        color: "#445566",
        id: "dairy",
        parentId: null,
      }),
    );
  });

  it("SHOULD NOT cascade WHEN the switch is turned off", async () => {
    const { result } = setup({ id: "dairy" });

    act(() => result.current.onColorChange("#445566"));
    act(() => result.current.onApplyToggle());
    act(() => result.current.onSave());
    await runSave();

    expect(useCases.updateStockCategoryUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        applyToChildren: false,
        childColors: undefined,
      }),
    );
  });

  it("SHOULD update a location with its parent and archive / reactivate through the status", async () => {
    const { result } = setup({ id: "pantry", kind: "location" });

    act(() => result.current.onParentChange(""));
    act(() => result.current.onSave());
    await runSave();

    expect(useCases.updateStockLocationUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: "pantry", parentId: null }),
    );

    (save.value.mutate as jest.Mock).mockClear();
    act(() => result.current.onToggleArchive());
    await runSave();
    expect(
      useCases.updateStockLocationUseCase.execute,
    ).toHaveBeenLastCalledWith({
      id: "pantry",
      status: "ARCHIVED",
    });
  });

  it("SHOULD archive a category AND reactivate an archived one", async () => {
    const first = setup({ id: "dairy" });

    act(() => first.result.current.onToggleArchive());
    await runSave();
    expect(
      useCases.updateStockCategoryUseCase.execute,
    ).toHaveBeenLastCalledWith({
      id: "dairy",
      status: "ARCHIVED",
    });

    (save.value.mutate as jest.Mock).mockClear();
    const second = setup({
      categories: [{ ...dairy, status: "ARCHIVED" }],
      id: "dairy",
    });

    expect(second.result.current.isArchived).toBe(true);
    act(() => second.result.current.onToggleArchive());
    await runSave();
    expect(
      useCases.updateStockCategoryUseCase.execute,
    ).toHaveBeenLastCalledWith({
      id: "dairy",
      status: "ACTIVE",
    });
  });

  it("SHOULD do nothing on archive WHEN creating", () => {
    const { result } = setup();

    act(() => result.current.onToggleArchive());
    expect(save.value.mutate).not.toHaveBeenCalled();
  });
});

describe("child action", () => {
  it("SHOULD offer a child WHEN the depth allows it", () => {
    expect(setup({ id: "dairy" }).result.current.canAddChild).toBe(true);
    // level 2 of 3 for categories still fits one more level, a location child is the last level
    expect(setup({ id: "child" }).result.current.canAddChild).toBe(true);
    expect(
      setup({ id: "pantry", kind: "location" }).result.current.canAddChild,
    ).toBe(true);
  });

  it("SHOULD NOT offer a child at the last level, for a new row or an archived one", () => {
    const deep = node("deep", "Deep", { parentId: "child" });
    const categories = [
      node("dairy", "Dairy", {
        children: [
          node("child", "Cheese", { children: [deep], parentId: "dairy" }),
        ],
      }),
    ];

    expect(setup({ categories, id: "deep" }).result.current.canAddChild).toBe(
      false,
    );
    expect(setup().result.current.canAddChild).toBe(false);
    expect(
      setup({ categories: [{ ...dairy, status: "ARCHIVED" }], id: "dairy" })
        .result.current.canAddChild,
    ).toBe(false);
    expect(
      setup({
        id: "sub",
        kind: "location",
        locations: [
          node("pantry", "Pantry", {
            children: [node("sub", "Shelf", { parentId: "pantry" })],
          }),
        ],
      }).result.current.canAddChild,
    ).toBe(false);
  });
});

describe("pickers and feedback", () => {
  it("SHOULD open and close the icon picker and the custom color sheet", () => {
    const { result } = setup({ id: "meat" });

    act(() => result.current.onIconOpen());
    expect(result.current.iconOpen).toBe(true);
    act(() => result.current.onIconClose());
    expect(result.current.iconOpen).toBe(false);

    act(() => result.current.onCustomOpen());
    expect(result.current.customOpen).toBe(true);
    expect(result.current.customDraft).toBe("#3B82F6");

    act(() => result.current.onCustomDraftChange("zzz"));
    expect(result.current.customError).toBe("invalid");

    act(() => result.current.onCustomDraftChange("#a1b2c3"));
    expect(result.current.customError).toBeUndefined();
    act(() => result.current.onCustomApply());
    expect(result.current.iconColor).toBe("#A1B2C3");
    expect(result.current.customOpen).toBe(false);

    act(() => result.current.onCustomOpen());
    act(() => result.current.onCustomClose());
    expect(result.current.customOpen).toBe(false);
  });

  it("SHOULD list the expense finance categories and the inherited one of the parent", () => {
    finance.withData([
      new CategoryDTO({
        icon: "f",
        iconColor: "#fff000",
        id: "fin-1",
        name: "Mercado",
        owner: "USER",
        ownerId: "u",
        type: "EXPENSE",
      }),
      new CategoryDTO({
        icon: "f",
        iconColor: "#fff000",
        id: "inc",
        name: "Salário",
        owner: "USER",
        ownerId: "u",
        type: "INCOME",
      }),
    ]);
    const { result } = setup({ parentId: "dairy" });

    expect(result.current.financeOptions).toEqual([
      { label: "Mercado", value: "fin-1" },
    ]);
    expect(result.current.inheritedFinance).toBe("fin-1");
  });

  it("SHOULD flag a duplicate name AND a refused rule from the save error", () => {
    save.withError(new StockCatalogNameTaken() as never);
    expect(setup().result.current.nameTaken).toBe(true);

    save.reset().withError(new StockCatalogRule() as never);
    expect(setup().result.current.ruleError).toBe(true);
  });

  it("SHOULD close after a successful save", () => {
    save.value.status = "success";
    const { props: value } = setup();

    expect(save.value.reset).toHaveBeenCalled();
    expect(value.onSaved).toHaveBeenCalled();
  });
});
