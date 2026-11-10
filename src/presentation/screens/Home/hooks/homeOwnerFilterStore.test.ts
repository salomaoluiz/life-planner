import { act, renderHook } from "@tests";

import * as monitoring from "@infrastructure/monitoring";

import { ALL_FILTER } from "../models/ownerFilter";
import {
  resetHomeOwnerFilter,
  useHomeOwnerFilter,
} from "./homeOwnerFilterStore";

const setTagSpy = jest.spyOn(monitoring, "setTag").mockImplementation();

beforeEach(() => {
  resetHomeOwnerFilter();
  jest.clearAllMocks();
});

it("SHOULD start with All", () => {
  const { result } = renderHook(() => useHomeOwnerFilter());

  expect(result.current[0]).toBe(ALL_FILTER);
});

it("SHOULD share the selection between hook instances (kept while the app runs)", () => {
  const first = renderHook(() => useHomeOwnerFilter());
  const second = renderHook(() => useHomeOwnerFilter());

  act(() => first.result.current[1]("family-1"));

  expect(second.result.current[0]).toBe("family-1");
});

it("SHOULD keep the selection after the screen unmounts and mounts again", () => {
  const first = renderHook(() => useHomeOwnerFilter());
  act(() => first.result.current[1]("PERSONAL"));
  first.unmount();

  const again = renderHook(() => useHomeOwnerFilter());

  expect(again.result.current[0]).toBe("PERSONAL");
});

it("SHOULD NOT notify WHEN the value does not change", () => {
  const { result } = renderHook(() => useHomeOwnerFilter());
  const renders = jest.fn();
  renderHook(() => {
    renders();
    return useHomeOwnerFilter();
  });
  renders.mockClear();

  act(() => result.current[1](ALL_FILTER));

  expect(renders).not.toHaveBeenCalled();
});

it("SHOULD tag the monitoring events with the selected owner (spec 106)", () => {
  const { result } = renderHook(() => useHomeOwnerFilter());

  act(() => result.current[1]("PERSONAL"));
  expect(setTagSpy).toHaveBeenCalledWith("owner_type", "USER");
  expect(setTagSpy).toHaveBeenCalledWith("family_id", undefined);

  act(() => result.current[1]("family-1"));
  expect(setTagSpy).toHaveBeenCalledWith("owner_type", "FAMILY");
  expect(setTagSpy).toHaveBeenCalledWith("family_id", "family-1");

  act(() => result.current[1](ALL_FILTER));
  expect(setTagSpy).toHaveBeenCalledWith("owner_type", "ALL");
});
