import { StyleSheet } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface IconTileButtonProps {
  /** The first search result is highlighted (spec 058). */
  highlighted?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  testID?: string;
  /** `labeled` shows the name under the icon (search results); `plain` is the icon alone (grouped grid). */
  variant?: "labeled" | "plain";
}

// A square choice tile for the icon catalog: the icon, optionally with its name.
function IconTileButton(props: IconTileButtonProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const labeled = props.variant !== "plain";
  const styles = StyleSheet.create({
    tile: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: radius.sm,
      borderWidth: 1,
      gap: spacing.xs,
      justifyContent: "center",
      minHeight: labeled ? sizes.touchTarget * 2 : sizes.touchTarget,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
    },
    tileOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  });
  const on = !!props.selected || !!props.highlighted;

  return (
    <Touchable
      accessibilityLabel={props.label}
      accessibilityRole={"radio"}
      onPress={props.onPress}
      selected={!!props.selected}
      style={[styles.tile, on && styles.tileOn]}
      testID={props.testID}
    >
      <Icon
        color={on ? colors.accentText : colors.textPrimary}
        name={props.icon}
        size={labeled ? 28 : 24}
      />
      {labeled && (
        <Text.Caption align={"center"} tone={"primary"} value={props.label} />
      )}
    </Touchable>
  );
}

export default IconTileButton;
