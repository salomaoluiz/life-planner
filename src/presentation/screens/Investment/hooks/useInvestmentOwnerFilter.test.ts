import { act, renderHook } from "@tests";

import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

import useInvestmentOwnerFilter, {
  resetInvestmentOwnerFilter,
} from "./useInvestmentOwnerFilter";

beforeEach(() => {
  resetInvestmentOwnerFilter();
});

it("SHOULD start with every owner", () => {
  const { result } = renderHook(() => useInvestmentOwnerFilter());

  expect(result.current[0]).toBe(ALL_OWNERS);
});

it("SHOULD share the choice between the two sections (two consumers)", () => {
  const overview = renderHook(() => useInvestmentOwnerFilter());
  const assets = renderHook(() => useInvestmentOwnerFilter());

  act(() => overview.result.current[1]("family-1"));

  expect(overview.result.current[0]).toBe("family-1");
  expect(assets.result.current[0]).toBe("family-1");
});

it("SHOULD keep the choice WHEN a section unmounts AND the other mounts", () => {
  const first = renderHook(() => useInvestmentOwnerFilter());

  act(() => first.result.current[1]("user-1"));
  first.unmount();

  expect(renderHook(() => useInvestmentOwnerFilter()).result.current[0]).toBe(
    "user-1",
  );
});

it("SHOULD go back to every owner WHEN reset", () => {
  const { result } = renderHook(() => useInvestmentOwnerFilter());

  act(() => result.current[1]("user-1"));
  act(() => resetInvestmentOwnerFilter());

  expect(result.current[0]).toBe(ALL_OWNERS);
});
