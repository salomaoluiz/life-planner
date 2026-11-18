import { useIsFocused } from "@react-navigation/native";
import { act, renderHook } from "@testing-library/react-native";

import { modalNavigation } from "@tests/modalNavigation";

import { useCases } from "@application/useCases";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";
import { dto, owners } from "@screens/Stock/models/stockUi.fixtures";

import useStockItemDetailsViewModel from "./useStockItemDetailsViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@presentation/hooks/useOwners");
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteStockItemUseCase: { execute: jest.fn(), uniqueName: "delete_stock" },
    getStockItemUseCase: { execute: jest.fn(), uniqueName: "get_stock_item" },
    getStockMovementsUseCase: {
      execute: jest.fn(),
      uniqueName: "get_movements",
    },
  },
}));

const detail = dto((f) => f.withId("stock-1").withDescription("Leite"));
const item = new StockItemUIModel(detail, owners, "en-US");
function page(ids: string[], nextCursor?: string) {
  return {
    items: ids.map((id) => ({
      createdAt: new Date(2026, 10, 10),
      id,
      lotId: "l",
      quantity: 1,
      type: StockMovementTypes.ENTRY,
    })),
    nextCursor,
  };
}

const detailQuery = new UseQueryFixture<typeof detail>();
const pageQuery = new UseQueryFixture<ReturnType<typeof page>>();
const mutation = new UseMutationFixture<
  { id: string; ownerId: string },
  void
>();
let built = mutation.reset().build();
const onClose = jest.fn();
const onDeleted = jest.fn();

function rebuild(status: "error" | "idle" | "success", isFetching = false) {
  built = {
    ...mutation.reset().withStatus(status).withIsFetching(isFetching).build(),
    mutate: built.mutate,
  };
}

function setup(
  detailData: typeof detail | undefined = detail,
  firstPage = page(["m1"], "next"),
) {
  detailQuery.reset();
  pageQuery.reset();
  if (detailData) detailQuery.withData(detailData);
  if (firstPage) pageQuery.withData(firstPage);
  const detailBuilt = detailQuery.build();
  const pageBuilt = pageQuery.build();

  jest.mocked(useMutation).mockImplementation(() => built as never);
  jest
    .mocked(useQuery)
    .mockImplementation(
      ((props: { cacheKey: string[] }) =>
        (props.cacheKey[0] === "get_stock_item"
          ? detailBuilt
          : pageBuilt) as never) as never,
    );
  jest.mocked(useOwners).mockReturnValue({ data: owners } as never);

  return renderHook(() =>
    useStockItemDetailsViewModel({ item, onClose, onDeleted }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useIsFocused).mockReturnValue(true);
  rebuild("idle");
});

describe("loading", () => {
  it("SHOULD build the details model AND the history of the first page", () => {
    const { result } = setup();

    expect(result.current.model?.description).toBe("Leite");
    expect(result.current.history).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("SHOULD be loading WHILE the detail has no data AND report an error without data", () => {
    detailQuery.reset().withIsFetching(true);
    pageQuery.reset().withIsFetching(true);
    jest
      .mocked(useQuery)
      .mockImplementation(
        ((props: { cacheKey: string[] }) =>
          (props.cacheKey[0] === "get_stock_item"
            ? detailQuery.build()
            : pageQuery.build()) as never) as never,
      );
    jest.mocked(useOwners).mockReturnValue({ data: undefined } as never);

    const { result } = renderHook(() =>
      useStockItemDetailsViewModel({ item, onClose, onDeleted }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isHistoryLoading).toBe(true);
    expect(result.current.model).toBeUndefined();
    expect(result.current.history).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it("SHOULD expose the load error", () => {
    detailQuery.reset().withError();
    jest
      .mocked(useQuery)
      .mockImplementation(
        ((props: { cacheKey: string[] }) =>
          (props.cacheKey[0] === "get_stock_item"
            ? detailQuery.build()
            : pageQuery.reset().build()) as never) as never,
      );
    jest.mocked(useOwners).mockReturnValue({ data: owners } as never);

    const { result } = renderHook(() =>
      useStockItemDetailsViewModel({ item, onClose, onDeleted }),
    );

    expect(result.current.loadErrorKey).toBe("stock.details.error");
  });
});

describe("history paging", () => {
  it("SHOULD append the next page WHEN loading more AND stop WHEN there is no cursor", async () => {
    jest
      .mocked(useCases.getStockMovementsUseCase.execute)
      .mockResolvedValue(page(["m2"]) as never);
    const { result } = setup();

    await act(async () => result.current.onLoadMore());

    expect(useCases.getStockMovementsUseCase.execute).toHaveBeenCalledWith({
      cursor: "next",
      itemId: "stock-1",
    });
    expect(result.current.history).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);

    await act(async () => result.current.onLoadMore());
    expect(useCases.getStockMovementsUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("SHOULD not load WHILE a page is loading", async () => {
    const control: { release: (value: unknown) => void } = {
      release: () => undefined,
    };

    jest.mocked(useCases.getStockMovementsUseCase.execute).mockReturnValue(
      new Promise((resolve) => {
        control.release = resolve;
      }) as never,
    );
    const { result } = setup();

    act(() => {
      void result.current.onLoadMore();
    });
    act(() => {
      void result.current.onLoadMore();
    });

    expect(useCases.getStockMovementsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result.current.isLoadingMore).toBe(true);
    await act(async () => control.release(page(["m2"])));
  });
});

describe("actions", () => {
  it.each([
    ["onEntry", StockMovementTypes.ENTRY],
    ["onConsume", StockMovementTypes.CONSUME],
    ["onOpen", StockMovementTypes.OPEN],
    ["onAdjust", StockMovementTypes.ADJUST],
  ] as const)("SHOULD open the movement modal from %s", (action, type) => {
    const { result } = setup();

    act(() => result.current[action]());

    expect(modalNavigation.openModal).toHaveBeenCalledWith("stock_movement", {
      itemId: "stock-1",
      lotId: undefined,
      ownerId: item.ownerId,
      type,
    });
  });

  it("SHOULD discard a lot and edit the item", () => {
    const { result } = setup();

    act(() => result.current.onDiscard("lot-1"));
    act(() => result.current.onEdit());

    expect(modalNavigation.openModal).toHaveBeenCalledWith("stock_movement", {
      itemId: "stock-1",
      lotId: "lot-1",
      ownerId: item.ownerId,
      type: StockMovementTypes.DISCARD,
    });
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "add_new_stock_item",
      { itemId: "stock-1", ownerId: item.ownerId },
    );
  });

  it("SHOULD retry the detail", async () => {
    const { result } = setup();

    await act(async () => result.current.onRetry());

    expect(detailQuery.build().refetch).toBeDefined();
  });
});

describe("delete", () => {
  it("SHOULD open and cancel the confirmation", () => {
    const { result } = setup();

    act(() => result.current.onDeletePress());
    expect(result.current.isConfirmOpen).toBe(true);

    act(() => result.current.onCancelDelete());
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it("SHOULD delete the item of its owner AND ignore a second press while deleting", () => {
    const { result } = setup();

    act(() => result.current.onConfirmDelete());
    expect(built.mutate).toHaveBeenCalledWith({
      id: "stock-1",
      ownerId: item.ownerId,
    });

    rebuild("idle", true);
    const again = setup();

    act(() => again.result.current.onConfirmDelete());
    expect(built.mutate).toHaveBeenCalledTimes(1);
    expect(again.result.current.isDeleting).toBe(true);
  });

  it("SHOULD close the confirmation and tell the screen WHEN deleted", () => {
    rebuild("success");
    const { result } = setup();

    expect(onDeleted).toHaveBeenCalled();
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it("SHOULD close the confirmation and show the error WHEN it fails", () => {
    rebuild("error");
    const { result } = setup();

    expect(result.current.errorKey).toBe("common.errors.generic");
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe("focus", () => {
  it("SHOULD report the screen focus so the sheet hides while a modal is open on top", () => {
    const { result } = setup();

    expect(result.current.isFocused).toBe(true);

    jest.mocked(useIsFocused).mockReturnValue(false);
    const hidden = setup();

    expect(hidden.result.current.isFocused).toBe(false);
  });
});
