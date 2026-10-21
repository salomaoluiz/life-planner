import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface FilterButtonProps {
  accessibilityLabel: string;
  /** Number of active filter groups: 0 shows the plain button, more shows the highlighted one with a badge */
  count: number;
  /** Hide the text on narrow layouts: the funnel icon and the badge stay */
  iconOnly?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

// The "Filters" button: a funnel, the label and the number of active groups.
function FilterButton(props: FilterButtonProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const active = props.count > 0;
  const foreground = active ? colors.accentText : colors.textPrimary;
  const styles = StyleSheet.create({
    badge: {
      alignItems: "center",
      backgroundColor: colors.accent,
      borderRadius: radius.full,
      height: 20,
      justifyContent: "center",
      minWidth: 20,
      paddingHorizontal: spacing.xxs,
    },
    root: {
      alignItems: "center",
      backgroundColor: active ? colors.accentSoft : colors.surface,
      borderColor: active ? colors.accent : colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      minHeight: sizes.touchTarget,
      paddingHorizontal: spacing.sm,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      onPress={props.onPress}
      style={styles.root}
      testID={testID}
    >
      <Icon color={foreground} name="filter-variant" size={sizes.iconMd} />
      {props.iconOnly ? null : (
        <Text.BodyStrong color={foreground} value={props.label} />
      )}
      {active ? (
        <View style={styles.badge}>
          <Text.Caption
            color={colors.onAccent}
            testID={testID && `${testID}-badge`}
            value={String(props.count)}
          />
        </View>
      ) : null}
    </Touchable>
  );
}

export default FilterButton;
