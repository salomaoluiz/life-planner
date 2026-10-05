import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { iconLabel } from "@presentation/constants/categoryIcons";

export interface IconChoiceGroupProps {
  color?: string;
  label: string;
  moreLabel?: string;
  onChange: (value: string) => void;
  onMorePress?: () => void;
  options: { label: string; value: string }[];
  testID?: string;
  value: string;
}

function IconChoiceGroup(props: IconChoiceGroupProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    group: { gap: spacing.xs },
    tile: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: radius.sm,
      borderWidth: 1,
      height: sizes.touchTarget,
      justifyContent: "center",
      width: sizes.touchTarget,
    },
    tileSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  });
  const hasValue = props.value !== "";
  const isListed = props.options.some((option) => option.value === props.value);
  const tiles =
    hasValue && !isListed
      ? [
          ...props.options,
          { label: iconLabel(props.value), value: props.value },
        ]
      : props.options;
  const showMore = !!props.moreLabel && !!props.onMorePress;

  return (
    <View style={styles.group} testID={props.testID}>
      <Text.Caption value={props.label} />
      <View style={styles.wrap}>
        {tiles.map((option) => {
          const selected = option.value === props.value;

          return (
            <Touchable
              accessibilityLabel={option.label}
              accessibilityRole={"radio"}
              key={option.value}
              onPress={() => props.onChange(option.value)}
              selected={selected}
              style={[styles.tile, selected && styles.tileSelected]}
              testID={`${props.testID}-icon-${option.value}`}
            >
              <Icon
                color={
                  props.color ??
                  (selected ? colors.accentText : colors.textPrimary)
                }
                name={option.value}
                size={24}
              />
            </Touchable>
          );
        })}
        {showMore && (
          <Touchable
            accessibilityLabel={props.moreLabel}
            accessibilityRole={"button"}
            onPress={props.onMorePress}
            style={styles.tile}
            testID={`${props.testID}-more`}
          >
            <Icon
              color={colors.textSecondary}
              name={"dots-horizontal"}
              size={24}
            />
          </Touchable>
        )}
      </View>
    </View>
  );
}

export default IconChoiceGroup;
