import { renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";

import { refreshSessionIfNeeded } from "./refresh";
import { useRefreshOnForeground } from "./useRefreshOnForeground";

jest.mock("./refresh", () => ({ refreshSessionIfNeeded: jest.fn() }));

function noop() {}

const remove = jest.fn();
let handler: (state: string) => void = noop;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(AppState, "addEventListener").mockImplementation(((
    _type: string,
    callback: (state: string) => void,
  ) => {
    handler = callback;
    return { remove };
  }) as never);
});

it("SHOULD refresh WHEN the app becomes active, not for other states", () => {
  renderHook(() => useRefreshOnForeground());

  handler("background");
  expect(refreshSessionIfNeeded).not.toHaveBeenCalled();

  handler("active");
  expect(refreshSessionIfNeeded).toHaveBeenCalledTimes(1);
});

it("SHOULD unsubscribe on unmount", () => {
  const { unmount } = renderHook(() => useRefreshOnForeground());

  unmount();

  expect(remove).toHaveBeenCalledTimes(1);
});
