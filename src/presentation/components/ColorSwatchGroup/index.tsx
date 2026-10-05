import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ColorSwatchGroupProps {
  customLabel: string;
  label: string;
  onChange: (value: string) => void;
  onCustomPress: () => void;
  options: { label: string; value: string }[];
  testID?: string;
  value: string;
}

const SWATCH = 36;
const RING = 2;
const CHECK = 16;

function ColorSwatchGroup(props: ColorSwatchGroupProps) {
  const { colors, radius, spacing } = useKitTheme();
  const isCustom = !props.options.some((option) =>
    sameColor(option.value, props.value),
  );
  function swatchFill(color: string) {
    return StyleSheet.create({ fill: { backgroundColor: color } }).fill;
  }

  const styles = StyleSheet.create({
    group: { gap: spacing.xs },
    ring: {
      alignItems: "center",
      borderRadius: radius.full,
      height: SWATCH + RING * 4,
      justifyContent: "center",
      width: SWATCH + RING * 4,
    },
    ringSelected: { borderColor: colors.accent, borderWidth: RING },
    swatch: {
      alignItems: "center",
      borderRadius: radius.full,
      height: SWATCH,
      justifyContent: "center",
      width: SWATCH,
    },
    swatchCustom: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderWidth: 1,
    },
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xxs },
  });

  return (
    <View style={styles.group} testID={props.testID}>
      <Text.Caption value={props.label} />
      <View style={styles.wrap}>
        {props.options.map((option) => {
          const selected = sameColor(option.value, props.value);

          return (
            <Touchable
              accessibilityLabel={option.label}
              accessibilityRole={"radio"}
              focusRadius={radius.full}
              key={option.value}
              onPress={() => props.onChange(option.value)}
              selected={selected}
              style={[styles.ring, selected && styles.ringSelected]}
              testID={`${props.testID}-swatch-${option.value}`}
            >
              <View style={[styles.swatch, swatchFill(option.value)]}>
                {selected && (
                  <Icon color={colors.onAccent} name={"check"} size={CHECK} />
                )}
              </View>
            </Touchable>
          );
        })}
        <Touchable
          accessibilityLabel={props.customLabel}
          accessibilityRole={"radio"}
          focusRadius={radius.full}
          onPress={props.onCustomPress}
          selected={isCustom}
          style={[styles.ring, isCustom && styles.ringSelected]}
          testID={`${props.testID}-custom`}
        >
          <View
            style={[
              styles.swatch,
              isCustom ? swatchFill(props.value) : styles.swatchCustom,
            ]}
          >
            <Icon
              color={isCustom ? colors.onAccent : colors.textSecondary}
              name={isCustom ? "check" : "palette-outline"}
              size={CHECK}
            />
          </View>
        </Touchable>
      </View>
    </View>
  );
}

function sameColor(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

export default ColorSwatchGroup;
