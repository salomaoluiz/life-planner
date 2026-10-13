import { StyleSheet } from "react-native";

// Home is 960 wide on desktop for two columns; a full-width list puts amounts too far from titles.
const LIST_MAX_WIDTH = 720;

function useStyles() {
  return {
    styles: StyleSheet.create({
      list: { alignSelf: "center", maxWidth: LIST_MAX_WIDTH, width: "100%" },
    }),
  };
}

export default useStyles;
