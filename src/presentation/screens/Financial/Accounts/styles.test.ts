import { StyleSheet } from "react-native";

import { renderHook } from "@tests";

import { isWeb } from "@utils/platform";

import getStyles from "./styles";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

function setup(web: boolean) {
  jest.mocked(isWeb).mockReturnValue(web);
  return renderHook(() => getStyles()).result.current.styles;
}

it("SHOULD add web paddings and margins WHEN on web", () => {
  const styles = setup(true);

  expect(StyleSheet.flatten(styles.container).paddingTop).toBeDefined();
  expect(
    StyleSheet.flatten(styles.listContainer).marginHorizontal,
  ).toBeDefined();
  expect(
    StyleSheet.flatten(styles.listContentContainer).paddingVertical,
  ).toBeDefined();
});

it("SHOULD NOT add web paddings and margins WHEN on native", () => {
  const styles = setup(false);

  expect(StyleSheet.flatten(styles.container).paddingTop).toBeUndefined();
  expect(
    StyleSheet.flatten(styles.listContainer).marginHorizontal,
  ).toBeUndefined();
  expect(
    StyleSheet.flatten(styles.listContentContainer).paddingVertical,
  ).toBeUndefined();
});
