import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    width: "100%",
  },
  buttonBase: {
    borderRadius: 0,
    flex: 1,
  },
  buttonContent: {
    height: 48,
  },
  buttonWrapper: {
    borderRadius: 16,
    flex: 1,
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
});
