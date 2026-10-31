import { Text as RNText, StyleSheet, View } from "react-native";

import Spinner from "@components/Spinner";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ProgressChipProps {
  label: string;
  testID?: string;
}

// Small pill with a spinner and a label: a row or a total whose request is still running.
function ProgressChip(props: ProgressChipProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const styles = StyleSheet.create({
    label: { ...typography.caption, color: colors.textSecondary },
    root: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.accentSoft,
      borderRadius: radius.full,
      flexDirection: "row",
      gap: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
  });

  return (
    <View
      accessibilityLabel={props.label}
      accessibilityLiveRegion={"polite"}
      style={styles.root}
      testID={props.testID}
    >
      <Spinner />
      <RNText style={styles.label}>{props.label}</RNText>
    </View>
  );
}

export default ProgressChip;
