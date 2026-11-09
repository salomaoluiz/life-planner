import { StyleSheet, View } from "react-native";

import FieldShell from "@components/FieldShell";
import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ChoiceTileGroupProps {
  disabled?: boolean;
  label?: string;
  onChange: (value: string) => void;
  options: ChoiceTileOption[];
  testID?: string;
  value: string;
}

export interface ChoiceTileOption {
  icon: string;
  label: string;
  /** Overrides `<group testID>-<value>` for this tile. */
  testID?: string;
  value: string;
}

// A two-column grid of radio tiles (icon + label): the roomy twin of a chip row, for web and tablet.
function ChoiceTileGroup(props: ChoiceTileGroupProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    tile: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: radius.sm,
      borderWidth: 1,
      flexBasis: "47%",
      flexDirection: "row",
      flexGrow: 1,
      gap: spacing.sm,
      minHeight: sizes.touchTarget,
      paddingHorizontal: spacing.md,
    },
    tileSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
  });

  return (
    <FieldShell
      disabled={props.disabled}
      label={props.label}
      testID={props.testID}
    >
      <View accessibilityRole={"radiogroup"} style={styles.grid}>
        {props.options.map((option) => {
          const selected = option.value === props.value;

          return (
            <Touchable
              accessibilityLabel={option.label}
              accessibilityRole={"radio"}
              disabled={props.disabled}
              key={option.value}
              onPress={() => props.onChange(option.value)}
              selected={selected}
              style={[styles.tile, selected && styles.tileSelected]}
              testID={
                option.testID ??
                (props.testID && `${props.testID}-${option.value}`)
              }
            >
              <Icon
                color={selected ? colors.accentText : colors.textPrimary}
                name={option.icon}
                size={20}
              />
              <Text.Body
                tone={selected ? "accent" : "primary"}
                value={option.label}
              />
            </Touchable>
          );
        })}
      </View>
    </FieldShell>
  );
}

export default ChoiceTileGroup;
