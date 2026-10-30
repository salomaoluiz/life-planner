import { act, renderHook } from "@tests";

import CategoryIconDTO from "@application/dto/financial/CategoryIconDTO";
import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useIconSearch from "./useIconSearch";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getCategoryIconsUseCase: { execute: jest.fn(), uniqueName: "icons" },
  },
}));

function icon(name: string, group: string) {
  return new CategoryIconDTO({
    common: false,
    group,
    labelEn: name,
    labelPt: name,
    name,
  });
}

const query = new UseQueryFixture<CategoryIconDTO[]>();

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  query.reset();
  jest.mocked(useQuery).mockImplementation((() => query.build()) as never);
});

afterEach(() => {
  jest.useRealTimers();
});

it("SHOULD debounce the typed text by 250 ms and key the cache by it", () => {
  let text = "";
  const { rerender, result } = renderHook(() => useIconSearch(text, true));

  for (const typed of ["pa", "pas", "pasta"]) {
    text = typed;
    rerender(undefined);
  }
  expect(result.current.debouncedQuery).toBe("");

  act(() => {
    jest.advanceTimersByTime(249);
  });
  expect(result.current.debouncedQuery).toBe("");

  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(result.current.debouncedQuery).toBe("pasta");
  expect(jest.mocked(useQuery).mock.calls.at(-1)?.[0].cacheKey).toEqual([
    "icons",
    "pasta",
  ]);
});

it("SHOULD be loading while pending, and group the whole catalog WHEN there is no query", () => {
  const { result } = renderHook(() => useIconSearch("", true));

  expect(result.current.status).toBe("loading");

  query
    .withStatus("success")
    .withData([
      icon("food", "FOOD"),
      icon("car", "TRANSPORT"),
      icon("x", "FOOD"),
    ]);
  const loaded = renderHook(() => useIconSearch("", true)).result.current;

  expect(loaded.status).toBe("success");
  expect(loaded.groups.map((g) => g.group)).toEqual(["FOOD", "TRANSPORT"]);
  expect(loaded.groups[0].icons).toHaveLength(2);
});

it("SHOULD report empty and error states and no groups WHEN searching", () => {
  query.withStatus("success").withData([]);
  const empty = renderHook(() => useIconSearch("zzz", true));

  act(() => {
    jest.advanceTimersByTime(250);
  });
  expect(empty.result.current.status).toBe("empty");
  expect(empty.result.current.groups).toEqual([]);

  query.reset().withStatus("error").withError(new GenericError());
  expect(renderHook(() => useIconSearch("", true)).result.current.status).toBe(
    "error",
  );
});

it("SHOULD refetch on retry", () => {
  const { result } = renderHook(() => useIconSearch("", true));

  result.current.retry();
  expect(query.value.refetch).toHaveBeenCalled();
});

it("SHOULD turn a failed search into an inline BusinessError", async () => {
  const execute = jest.mocked(useCases.getCategoryIconsUseCase.execute);

  execute.mockRejectedValueOnce(new Error("offline"));
  renderHook(() => useIconSearch("", true));
  const { fetch, networkMode, retry } = jest.mocked(useQuery).mock.calls[0][0];

  await expect(fetch()).rejects.toMatchObject({ name: "BusinessError" });
  expect(networkMode).toBe("always");
  expect(retry).toBe(false);
});

it("SHOULD send the debounced text (or nothing) to the use case", async () => {
  const execute = jest.mocked(useCases.getCategoryIconsUseCase.execute);

  execute.mockResolvedValue([]);
  renderHook(() => useIconSearch("", true));
  await jest.mocked(useQuery).mock.calls[0][0].fetch();

  expect(execute).toHaveBeenCalledWith({ q: undefined });
});
