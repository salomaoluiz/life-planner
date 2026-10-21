import { renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

import useFilterOptions from "./useFilterOptions";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getFinancialCreditCardsUseCase: { execute: jest.fn(), uniqueName: "cards" },
    getFinancialTagsUseCase: { execute: jest.fn(), uniqueName: "tags" },
  },
}));

const data: Record<string, unknown[]> = {
  accounts: [{ id: "a1", name: "Checking", status: "ARCHIVED" }],
  cards: [{ id: "k1", status: "ACTIVE", title: "Main card" }],
  categories: [
    { id: "c1", name: "Market", status: "ARCHIVED", type: "EXPENSE" },
  ],
  tags: [{ id: "t1", name: "fixo" }],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockImplementation(((options: {
    cacheKey: string[];
    enabled?: boolean;
    fetch: () => Promise<unknown>;
  }) => {
    options.fetch();

    return { data: data[options.cacheKey[0]], error: null };
  }) as never);
});

it("SHOULD name the sources, categories and tags of the owners", () => {
  const { result } = renderHook(() => useFilterOptions(["o1"], true));

  expect(result.current.sources).toEqual([
    { archived: true, id: "a1", kind: "ACCOUNT", name: "Checking" },
    { archived: false, id: "k1", kind: "CARD", name: "Main card" },
  ]);
  expect(result.current.categories[0]).toMatchObject({
    archived: true,
    id: "c1",
  });
  expect(result.current.tags).toHaveLength(1);
  expect(useCases.getFinancialAccountsUseCase.execute).toHaveBeenCalledWith([
    "o1",
  ]);
});

it("SHOULD stay disabled without owners or when not asked", () => {
  renderHook(() => useFilterOptions([], true));
  renderHook(() => useFilterOptions(["o1"], false));

  const enabled = jest
    .mocked(useQuery)
    .mock.calls.map(([options]) => (options as { enabled?: boolean }).enabled);

  expect(enabled.every((value) => value === false)).toBe(true);
});
