import { act } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  catalogQuery,
  financeQuery,
  givenData,
  node,
  owners,
  setup,
  spies,
  suggestCategories,
} from "./mocks/useStockCatalogScreenViewModel.mocks";
import { fetchCatalog } from "./useStockCatalogScreenViewModel";

const archivedFamily = new OwnerDTO({
  archived: true,
  id: "old-family",
  name: "Old",
  type: OwnerType.FAMILY,
});

describe("fetchCatalog", () => {
  it("SHOULD read both trees once for every owner, archived rows included", async () => {
    spies.getCategories.mockResolvedValue([node("a", "A")] as never);
    spies.getLocations.mockResolvedValue([node("b", "B")] as never);

    const result = await fetchCatalog(owners);

    expect(spies.getCategories).toHaveBeenCalledWith({ includeArchived: true });
    expect(spies.getLocations).toHaveBeenCalledWith({ includeArchived: true });
    expect(result.owners).toBe(owners);
    expect(result.categories).toHaveLength(1);
  });
});

describe("tabs and owner chips", () => {
  it("SHOULD start on the categories tab with every owner, rows in alphabetical order", () => {
    givenData([node("z", "Zeta"), node("a", "Alfa")], [node("l", "Loc")]);
    const { result } = setup();

    expect(result.current.tab).toBe("categories");
    expect(result.current.ownerFilter).toBe("ALL");
    expect(
      result.current.entries.map(
        (entry) => entry.kind === "row" && entry.row.node.id,
      ),
    ).toEqual(["a", "z"]);
  });

  it("SHOULD switch to the locations tab and remember it", () => {
    givenData([node("a", "A")], [node("l", "Loc")]);
    const { result } = setup();

    act(() => result.current.onTabChange("locations"));

    expect(result.current.tab).toBe("locations");
    expect(
      result.current.entries.map(
        (entry) => entry.kind === "row" && entry.row.node.id,
      ),
    ).toEqual(["l"]);
    // the choice survives a new mount in the same session
    expect(setup().result.current.tab).toBe("locations");

    act(() => result.current.onTabChange("categories"));
  });

  it("SHOULD filter by owner AND remember the chip", () => {
    givenData([node("a", "A"), node("f", "F", { ownerId: "family-1" })]);
    const { result } = setup();

    act(() => result.current.onOwnerFilterChange("family-1"));

    expect(
      result.current.entries.map(
        (entry) => entry.kind === "row" && entry.row.node.id,
      ),
    ).toEqual(["f"]);
    expect(setup().result.current.ownerFilter).toBe("family-1");

    act(() => result.current.onOwnerFilterChange("ALL"));
  });

  it("SHOULD hide archived families from All AND mark the scope read only when one is selected", () => {
    givenData(
      [node("a", "A"), node("x", "X", { ownerId: "old-family" })],
      [],
      [...owners, archivedFamily],
    );
    const { result } = setup();

    expect(
      result.current.entries.map(
        (entry) => entry.kind === "row" && entry.row.node.id,
      ),
    ).toEqual(["a"]);

    act(() => result.current.onOwnerFilterChange("old-family"));
    expect(result.current.readOnly).toBe(true);

    act(() => result.current.onAddPress());
    expect(result.current.editor).toBeUndefined();
    expect(result.current.toastVisible).toBe(true);

    act(() => result.current.onOwnerFilterChange("ALL"));
  });
});

describe("loading and refreshing", () => {
  it("SHOULD be loading without data and refreshing with it", () => {
    catalogQuery.withIsFetching(true);
    expect(setup().result.current.isLoading).toBe(true);

    givenData([node("a", "A")]);
    catalogQuery.withIsFetching(true);
    const { result } = setup();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it("SHOULD expose the error and refetch on retry AND on focus", async () => {
    spies.isFocused.mockReturnValue(true);
    catalogQuery.withError();
    const { result } = setup();

    expect(result.current.errorMessage).toBeDefined();
    expect(catalogQuery.value.refetch).toHaveBeenCalledTimes(1);

    await result.current.onRetry();
    await result.current.onRefresh();

    expect(catalogQuery.value.refetch).toHaveBeenCalledTimes(3);
  });
});

describe("editor", () => {
  it("SHOULD open a new row for the chip owner, a child of a row, and an edit with the row owner", () => {
    givenData([
      node("a", "A"),
      node("f", "F", { owner: "FAMILY", ownerId: "family-1" }),
    ]);
    const { result } = setup();

    act(() => result.current.onAddPress());
    expect(result.current.editor).toEqual({
      kind: "category",
      ownerId: "user-id",
      ownerKind: "USER",
    });

    act(() => result.current.onAddChild("f"));
    expect(result.current.editor).toMatchObject({
      ownerId: "family-1",
      ownerKind: "FAMILY",
      parentId: "f",
    });

    act(() => result.current.onRowPress("f"));
    expect(result.current.editor).toMatchObject({
      id: "f",
      ownerId: "family-1",
    });

    act(() => result.current.onEditorClose());
    expect(result.current.editor).toBeUndefined();
  });

  it("SHOULD open a location editor on the locations tab AND use the selected owner", () => {
    givenData([], [node("l", "Loc")]);
    const { result } = setup();

    act(() => result.current.onTabChange("locations"));
    act(() => result.current.onOwnerFilterChange("family-1"));
    act(() => result.current.onAddPress());

    expect(result.current.editor).toMatchObject({
      kind: "location",
      ownerId: "family-1",
      ownerKind: "FAMILY",
    });

    act(() => result.current.onOwnerFilterChange("ALL"));
    act(() => result.current.onTabChange("categories"));
  });

  it("SHOULD close the editor, refresh and refetch after a save", async () => {
    givenData([node("a", "A")]);
    const { result } = setup();

    act(() => result.current.onRowPress("a"));
    await act(async () => result.current.onSaved());

    expect(result.current.editor).toBeUndefined();
    expect(spies.invalidate).toHaveBeenCalledWith(["categories"]);
    expect(catalogQuery.value.refetch).toHaveBeenCalled();
  });

  it("SHOULD open the delete flow from the editor AND close it after the delete", async () => {
    givenData([node("a", "A")]);
    const { result } = setup();

    act(() => result.current.onRowPress("a"));
    act(() => result.current.onDeleteRequest("a", "category"));

    expect(result.current.editor).toBeUndefined();
    expect(result.current.deleting).toEqual({ id: "a", kind: "category" });

    act(() => result.current.onDeleteClose());
    expect(result.current.deleting).toBeUndefined();

    act(() => result.current.onDeleteRequest("a", "category"));
    await act(async () => result.current.onDeleted());
    expect(result.current.deleting).toBeUndefined();
  });

  it('SHOULD go to the filtered stock list from "Ver itens"', () => {
    givenData([node("a", "A")]);
    const { result } = setup();

    act(() => result.current.onViewItems("a", "category"));
    expect(spies.push).toHaveBeenLastCalledWith({
      params: { categoryId: "a" },
      pathname: "/stock",
    });

    act(() => result.current.onViewItems("l", "location"));
    expect(spies.push).toHaveBeenLastCalledWith("/stock/locations/l");
  });
});

describe("suggestions of an empty owner", () => {
  it("SHOULD list the owners without rows in the tab", () => {
    givenData([node("a", "A")]);
    const { result } = setup();

    expect(result.current.emptyOwners).toEqual([
      { id: "family-1", isPersonal: false, kind: "FAMILY", name: "Silva" },
    ]);
  });

  it("SHOULD toggle a suggestion off and on, per owner", () => {
    givenData([]);
    const { result } = setup();

    act(() => result.current.onToggleSuggestion("user-id", "DAIRY"));
    expect(result.current.unchecked["user-id"]).toEqual(["DAIRY"]);

    act(() => result.current.onToggleSuggestion("user-id", "DAIRY"));
    expect(result.current.unchecked["user-id"]).toEqual([]);
  });

  it("SHOULD create the chosen keys for the owner AND refresh after the success", async () => {
    givenData([]);
    const { rerender, result } = setup();

    act(() =>
      result.current.onCreateSuggestions("user-id", "USER", ["DAIRY", "MEAT"]),
    );
    expect(suggestCategories.value.mutate).toHaveBeenCalledWith({
      keys: ["DAIRY", "MEAT"],
      owner: "USER",
      ownerId: "user-id",
    });

    suggestCategories.value.status = "success";
    await act(async () => rerender({}));

    expect(suggestCategories.value.reset).toHaveBeenCalled();
    expect(spies.invalidate).toHaveBeenCalled();
  });

  it("SHOULD start a row from scratch for that owner", () => {
    givenData([]);
    const { result } = setup();

    act(() => result.current.onFromScratch("family-1"));

    expect(result.current.editor).toMatchObject({
      ownerId: "family-1",
      ownerKind: "FAMILY",
    });
  });
});

describe("print and finance", () => {
  it("SHOULD list the active locations with their path and open/close the print sheet", () => {
    givenData(
      [],
      [
        node("k", "Cozinha", {
          children: [node("f", "Geladeira", { parentId: "k" })],
        }),
        node("old", "Velho", { status: "ARCHIVED" }),
      ],
    );
    const { result } = setup();

    expect(result.current.printLocations.map((entry) => entry.path)).toEqual([
      "Cozinha",
      "Cozinha › Geladeira",
    ]);

    act(() => result.current.onPrintOpen());
    expect(result.current.printOpen).toBe(true);
    act(() => result.current.onPrintClose());
    expect(result.current.printOpen).toBe(false);
  });

  it("SHOULD resolve the finance category of a mapped row as a path", () => {
    givenData([node("a", "A", { financeCategoryId: "fin" })]);
    financeQuery.withData([
      new CategoryDTO({
        icon: "food",
        iconColor: "#F59E0B",
        id: "root",
        name: "Alimentação",
        owner: "USER",
        ownerId: "user-id",
        type: "EXPENSE",
      }),
      new CategoryDTO({
        icon: "food",
        iconColor: "#F59E0B",
        id: "fin",
        name: "Mercado",
        owner: "USER",
        ownerId: "user-id",
        parentId: "root",
        type: "EXPENSE",
      }),
    ]);
    const { result } = setup();

    expect(result.current.financeLabels.get("fin")).toBe(
      "Alimentação › Mercado",
    );
  });

  it("SHOULD toggle the archived group AND hide the toast", () => {
    givenData([node("a", "A", { status: "ARCHIVED" })]);
    const { result } = setup();

    act(() => result.current.onArchivedToggle());
    expect(result.current.archivedExpanded).toBe(true);

    act(() => result.current.onToastHide());
    expect(result.current.toastVisible).toBe(false);
  });
});
