import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { makeAsset, owners } from "@screens/Investment/mocks/fixtures";

import useInvestmentListViewModel, {
  fetchAssets,
} from "./useInvestmentListViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/useQuoteRefresh", () => ({
  __esModule: true,
  default: () => ({
    disabled: false,
    isRefreshing: false,
    onRefresh: jest.fn(),
    secondsLeft: 0,
    sourceDown: false,
  }),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentAssetsUseCase: { execute: jest.fn(), uniqueName: "assets" },
  },
}));

interface Data {
  assets: InvestmentAsset[];
  owners: OwnerDTO[];
}

const activeQuery = new UseQueryFixture<Data>();
const archivedQuery = new UseQueryFixture<Data>();

const spies = {
  getAssets: jest.mocked(useCases.getInvestmentAssetsUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useOwnerScopedQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  activeQuery.reset();
  archivedQuery.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey.includes(InvestmentAssetStatus.ARCHIVED)
      ? archivedQuery.build()
      : activeQuery.build()) as never);
});

function givenData(
  active: InvestmentAsset[],
  archived: InvestmentAsset[] = [],
) {
  activeQuery.reset().withData({ assets: active, owners });
  archivedQuery.reset().withData({ assets: archived, owners });
}

function setup() {
  return renderHook(() => useInvestmentListViewModel());
}

it("SHOULD fetch the assets of a status through the use case", async () => {
  spies.getAssets.mockResolvedValue([]);

  const data = await fetchAssets(InvestmentAssetStatus.ARCHIVED)(owners);

  expect(spies.getAssets).toHaveBeenCalledWith({ status: "ARCHIVED" });
  expect(data).toEqual({ assets: [], owners });
});

it("SHOULD group the active assets AND count both tabs", () => {
  givenData(
    [makeAsset(), makeAsset({ id: "asset-2", ticker: "WEGE3" })],
    [makeAsset({ id: "old", status: InvestmentAssetStatus.ARCHIVED })],
  );

  const { result } = setup();

  expect(result.current.assetsCount).toBe(2);
  expect(result.current.archivedCount).toBe(1);
  expect(result.current.entries.map((entry) => entry.kind)).toEqual([
    "group",
    "row",
    "row",
  ]);
  expect(result.current.hasAny).toBe(true);
});

it("SHOULD switch to the archived tab", () => {
  givenData(
    [makeAsset()],
    [makeAsset({ id: "old", status: InvestmentAssetStatus.ARCHIVED })],
  );
  const { result } = setup();

  act(() => result.current.onTabChange(InvestmentAssetStatus.ARCHIVED));

  expect(result.current.tab).toBe("ARCHIVED");
  expect(
    result.current.entries.filter((entry) => entry.kind === "row"),
  ).toHaveLength(1);
});

it("SHOULD filter by owner AND search, reporting no results", () => {
  givenData([
    makeAsset(),
    makeAsset({
      id: "fam",
      owner: OwnerType.FAMILY,
      ownerId: "fam-1",
      ticker: "WEGE3",
    }),
  ]);
  const { result } = setup();

  act(() => result.current.onOwnerFilterChange("fam-1"));
  expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
    1,
  );

  act(() => result.current.onSearchChange("zzz"));
  expect(result.current.noResults).toBe(true);
  expect(result.current.search).toBe("zzz");
});

it("SHOULD expose the empty, loading and error states", () => {
  givenData([]);
  expect(setup().result.current.isEmpty).toBe(true);

  activeQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  activeQuery.reset().withError();
  expect(setup().result.current.errorMessage).toBeDefined();

  activeQuery
    .reset()
    .withData({ assets: [makeAsset()], owners })
    .withIsFetching(true);
  expect(setup().result.current.isRefreshing).toBe(true);
});

it("SHOULD open the asset modal AND the detail route", () => {
  givenData([makeAsset()]);
  const { result } = setup();

  result.current.onAddPress();
  result.current.onRowPress("asset-1");

  expect(modalNavigation.openModal).toHaveBeenCalledWith("investment_asset");
  expect(spies.push).toHaveBeenCalledWith("/investments/asset/asset-1");
});

it("SHOULD refetch both lists WHEN focused AND on refresh", async () => {
  givenData([]);
  spies.isFocused.mockReturnValue(true);
  const { result } = setup();

  expect(activeQuery.value.refetch).toHaveBeenCalled();
  expect(archivedQuery.value.refetch).toHaveBeenCalled();

  await result.current.onRefresh();
  await result.current.onRetry();
  expect(activeQuery.value.refetch).toHaveBeenCalledTimes(3);
});

it("SHOULD block the add action on an archived family with the read-only toast", () => {
  const archivedOwners = [
    ...owners,
    new OwnerDTO({
      archived: true,
      id: "old",
      name: "Old",
      type: OwnerType.FAMILY,
    }),
  ];
  activeQuery.reset().withData({ assets: [], owners: archivedOwners });
  archivedQuery.reset().withData({ assets: [], owners: archivedOwners });
  const { result } = setup();

  act(() => result.current.onOwnerFilterChange("old"));
  act(() => result.current.onAddPress());

  expect(result.current.readOnly).toBe(true);
  expect(result.current.toastVisible).toBe(true);
  expect(modalNavigation.openModal).not.toHaveBeenCalled();

  act(() => result.current.onToastHide());
  expect(result.current.toastVisible).toBe(false);
});
