import { Text as RNText, StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ReadOnlyNoticeProps {
  message: string;
  testID?: string;
}

const LOCK = 18;

// "This data cannot be changed" row shown above read-only lists (archived family, spec 042).
function ReadOnlyNotice(props: ReadOnlyNoticeProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const styles = StyleSheet.create({
    message: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    root: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.md,
      flexDirection: "row",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  });

  return (
    <View role="status" style={styles.root} testID={props.testID}>
      <Icon color={colors.textSecondary} name="lock-outline" size={LOCK} />
      <RNText style={styles.message}>{props.message}</RNText>
    </View>
  );
}

export default ReadOnlyNotice;
