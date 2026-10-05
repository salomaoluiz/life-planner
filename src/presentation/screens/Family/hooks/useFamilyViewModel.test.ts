import { router } from "expo-router";

import { act, renderHook } from "@tests";

import { GenericError } from "@domain/entities/errors";
import { familyNamed } from "@screens/Family/mocks/index.mocks";

import useFamilies from "./useFamilies";
import useFamilyViewModel from "./useFamilyViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("./useFamilies");

const spies = {
  push: jest.mocked(router.push),
  useFamilies: jest.mocked(useFamilies),
};

const refetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

function given(value: Partial<ReturnType<typeof useFamilies>>) {
  spies.useFamilies.mockReturnValue({
    error: null,
    families: undefined,
    isFetching: false,
    refetch,
    status: "success",
    ...value,
  } as never);
}

const abc = [
  familyNamed("2", "Bela"),
  familyNamed("1", "Álamo"),
  familyNamed("3", "casa"),
];

it("SHOULD be loading WHEN there is no data yet", () => {
  given({ isFetching: true });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.status).toBe("loading");
});

it("SHOULD be error WHEN failed without data", () => {
  given({ error: new GenericError() });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.status).toBe("error");
});

it("SHOULD be empty WHEN there are no families", () => {
  given({ families: [] });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.status).toBe("empty");
  expect(result.current.subtitleKey).toBe("family.list.subtitle_other");
});

it("SHOULD stay ready AND flag refreshing WHEN refetching with data", () => {
  given({ families: abc, isFetching: true });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.status).toBe("ready");
  expect(result.current.refreshing).toBe(true);
});

it("SHOULD sort the families, count them AND pick the subtitle key", () => {
  given({ families: abc });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.families.map((family) => family.familyName)).toEqual([
    "Álamo",
    "Bela",
    "casa",
  ]);
  expect(result.current.count).toBe(3);
  expect(result.current.subtitleKey).toBe("family.list.subtitle_other");
});

it("SHOULD use the singular subtitle key FOR one family", () => {
  given({ families: [abc[0]] });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.subtitleKey).toBe("family.list.subtitle_one");
});

it("SHOULD expand the first family AND toggle each one independently", () => {
  given({ families: abc });

  const { result } = renderHook(() => useFamilyViewModel());

  expect(result.current.isExpanded("1")).toBe(true);
  expect(result.current.isExpanded("2")).toBe(false);

  act(() => result.current.onToggle("2"));
  act(() => result.current.onToggle("1"));

  expect(result.current.isExpanded("1")).toBe(false);
  expect(result.current.isExpanded("2")).toBe(true);
});

it("SHOULD keep the toggles WHEN rerendered with the same data", () => {
  given({ families: abc });
  const { rerender, result } = renderHook(() => useFamilyViewModel());

  act(() => result.current.onToggle("2"));
  given({ families: [...abc] });
  rerender({});

  expect(result.current.isExpanded("2")).toBe(true);
  expect(result.current.isExpanded("1")).toBe(true);
});

it("SHOULD expand a newly created family AND keep previous toggles", () => {
  given({ families: abc });
  const { rerender, result } = renderHook(() => useFamilyViewModel());

  act(() => result.current.onToggle("1"));
  given({ families: [...abc, familyNamed("4", "Zeta")] });
  rerender({});

  expect(result.current.isExpanded("4")).toBe(true);
  expect(result.current.isExpanded("1")).toBe(false);
});

it("SHOULD open the new family form AND refetch on retry or refresh", () => {
  given({ families: abc });
  const { result } = renderHook(() => useFamilyViewModel());

  act(() => result.current.onNewFamily());
  result.current.onRetry();
  result.current.onRefresh();

  expect(spies.push).toHaveBeenCalledWith("/family/add_new_family");
  expect(refetch).toHaveBeenCalledTimes(2);
});
