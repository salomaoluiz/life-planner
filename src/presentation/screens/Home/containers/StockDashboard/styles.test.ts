import { StyleSheet } from "react-native";

import { renderHook } from "@tests";

import { isWeb } from "@utils/platform";

import getStyles from "./styles";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

it.each([
  [true, "50%"],
  [false, "100%"],
])("SHOULD limit the card width WHEN isWeb is %s", (web, maxWidth) => {
  jest.mocked(isWeb).mockReturnValue(web);

  const styles = renderHook(() => getStyles()).result.current;

  expect(StyleSheet.flatten(styles.container).maxWidth).toBe(maxWidth);
  expect(StyleSheet.flatten(styles.containerLoading).maxWidth).toBe(maxWidth);
});
