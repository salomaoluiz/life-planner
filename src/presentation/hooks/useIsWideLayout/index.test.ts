import { renderHook } from "@tests";

import useWindowSize from "@components/utils/useWindowSize";

import useIsWideLayout from "./index";

jest.mock("@components/utils/useWindowSize");

it.each([
  [390, false],
  [767, false],
  [768, true],
  [1280, true],
])("SHOULD be %s wide: %s", (width, expected) => {
  jest.mocked(useWindowSize).mockReturnValue({ height: 800, width });

  expect(renderHook(() => useIsWideLayout()).result.current).toBe(expected);
});
