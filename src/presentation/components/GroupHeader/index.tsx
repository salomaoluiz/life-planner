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
  const { colors, radius, spacing } = useKitTheme();
  const interactive = !!props.onPress;
  const expanded = !!props.expanded;
  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
    // A pressable day opens into a card (the lines below close it): rounded, with room at the edges.
    interactive: {
      borderColor: expanded ? colors.border : "transparent",
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      ...(expanded
        ? {
            backgroundColor: colors.surface,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }
        : { borderRadius: radius.sm }),
    },
    titleColumn: { flexShrink: 1, gap: spacing.xxs },
  });
  const content = (
    <>
      <View style={interactive ? styles.titleColumn : undefined}>
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
        focusRadius={expanded ? radius.md : radius.sm}
        minTouchTarget={false}
        onPress={props.onPress}
        style={[styles.container, styles.interactive]}
        testID={props.testID}
      >
        {content}
      </Touchable>
    </Tooltip>
  );
}

export default GroupHeader;
