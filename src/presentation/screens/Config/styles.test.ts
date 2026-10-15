import { StyleSheet } from "react-native";

import { renderHook } from "@tests";

import useStyles from "./styles";

it("SHOULD space the fields by lg and align the logout action to the content edge", () => {
  const { styles } = renderHook(() => useStyles()).result.current;

  expect(StyleSheet.flatten(styles.fields).gap).toBe(20);
  expect(StyleSheet.flatten(styles.logout).alignItems).toBe("flex-start");
  expect(StyleSheet.flatten(styles.logout).gap).toBe(16);
});
