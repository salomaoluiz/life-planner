import { StyleSheet } from "react-native";

function useStyles() {
  return {
    styles: StyleSheet.create({
      badge: { position: "absolute", right: -4, top: -4 },
    }),
  };
}

export default useStyles;
