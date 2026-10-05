import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

import BoxSkeleton from "./Box";

function ListItemSkeleton(props: { testID?: string }) {
  const { radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    lines: { flex: 1, gap: spacing.xxs },
    root: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 56,
      paddingVertical: spacing.sm,
    },
  });

  return (
    <View style={styles.root} testID={props.testID}>
      <BoxSkeleton borderRadius={radius.sm} height={40} width={40} />
      <View style={styles.lines}>
        <BoxSkeleton height={14} width={160} />
        <BoxSkeleton height={12} width={100} />
      </View>
    </View>
  );
}

export default ListItemSkeleton;
