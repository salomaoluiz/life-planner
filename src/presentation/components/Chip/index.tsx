import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { getHitSlop } from "@components/utils/getHitSlop";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ChipProps {
  accessibilityLabel?: string;
  colorDot?: string;
  count?: number;
  disabled?: boolean;
  icon?: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
  testID?: string;
  variant?: "add" | "default";
}

const CHIP_HEIGHT = 36;
const DOT_SIZE = 8;

function Chip(props: ChipProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const selected = !!props.selected;
  const iconName = props.variant === "add" ? "plus" : props.icon;
  const foreground = selected ? colors.accentText : colors.textPrimary;

  const styles = StyleSheet.create({
    dot: {
      backgroundColor: props.colorDot,
      borderRadius: radius.full,
      height: DOT_SIZE,
      width: DOT_SIZE,
    },
    root: {
      alignItems: "center",
      backgroundColor: selected ? colors.accentSoft : colors.surface,
      borderColor: selected ? colors.accent : colors.border,
      borderRadius: radius.full,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      height: CHIP_HEIGHT,
      paddingHorizontal: spacing.sm,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityRole="button"
      disabled={props.disabled}
      focusRadius={radius.full}
      hitSlop={getHitSlop({ height: CHIP_HEIGHT }, sizes.touchTarget)}
      minTouchTarget={false}
      onPress={props.onPress}
      selected={selected}
      style={styles.root}
      testID={testID}
    >
      {props.colorDot ? (
        <View style={styles.dot} testID={testID && `${testID}-dot`} />
      ) : null}
      {iconName ? (
        <Icon
          color={foreground}
          name={iconName}
          size={sizes.iconSm}
          testID={testID && `${testID}-icon`}
        />
      ) : null}
      <Text.BodyStrong
        color={foreground}
        numberOfLines={1}
        value={props.label}
      />
      {props.count !== undefined ? (
        <Text.Caption
          color={selected ? colors.accentText : colors.textSecondary}
          testID={testID && `${testID}-count`}
          value={String(props.count)}
        />
      ) : null}
    </Touchable>
  );
}

export default Chip;
