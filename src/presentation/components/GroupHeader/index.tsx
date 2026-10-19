import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Tooltip from "@components/Tooltip";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface GroupHeaderProps {
  accessibilityLabel?: string;
  /** Disclosure state, exposed when `onPress` is set */
  expanded?: boolean;
  /** Secondary text next to the title */
  meta?: ReactNode;
  /** Makes the header a button (tap / Enter) */
  onPress?: () => void;
  testID?: string;
  title: string;
  /** Web hover bubble anchored under the header */
  tooltip?: ReactNode;
  trailing?: ReactNode;
}

function GroupHeader(props: GroupHeaderProps) {
  const { colors, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
    titleRow: {
      alignItems: "center",
      flexDirection: "row",
      flexShrink: 1,
      gap: spacing.xs,
    },
  });
  const content = (
    <>
      <View style={styles.titleRow}>
        <Text.Overline value={props.title} />
        {props.meta}
      </View>
      {props.trailing}
    </>
  );

  if (!props.onPress) {
    return (
      <View
        accessibilityRole="header"
        style={styles.container}
        testID={props.testID}
      >
        {content}
      </View>
    );
  }

  return (
    <Tooltip content={props.tooltip}>
      <Touchable
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole="button"
        expanded={props.expanded}
        focusRadius={0}
        minTouchTarget={false}
        onPress={props.onPress}
        style={styles.container}
        testID={props.testID}
      >
        {content}
      </Touchable>
    </Tooltip>
  );
}

export default GroupHeader;
