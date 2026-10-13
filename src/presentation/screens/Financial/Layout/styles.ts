import { StyleSheet } from "react-native";

function useStyles() {
  const styles = StyleSheet.create({
    content: { flex: 1 },
  });

  return { styles };
}

export default useStyles;
