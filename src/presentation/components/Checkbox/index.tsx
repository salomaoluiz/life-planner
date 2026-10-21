import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface CheckboxProps {
  /** `mixed` is a parent with only some children chosen */
  checked: "mixed" | boolean;
  disabled?: boolean;
  /** Left padding for a child row of a tree */
  indent?: number;
  label: string;
  onChange: () => void;
  testID?: string;
}

const BOX_SIZE = 22;

// A labeled box: checked, unchecked or partly chosen. The whole row is the 44 px touch target.
function Checkbox(props: CheckboxProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { checked, testID } = props;
  const filled = checked === true;
  let background = colors.surface;

  if (filled) {
    background = colors.accent;
  } else if (checked === "mixed") {
    background = colors.accentSoft;
  }
  const styles = StyleSheet.create({
    box: {
      alignItems: "center",
      backgroundColor: background,
      borderColor: checked ? colors.accent : colors.textSecondary,
      borderRadius: radius.sm,
      borderWidth: 2,
      height: BOX_SIZE,
      justifyContent: "center",
      width: BOX_SIZE,
    },
    root: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: sizes.touchTarget,
      paddingLeft: props.indent ?? 0,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.label}
      accessibilityRole="checkbox"
      checked={checked}
      disabled={props.disabled}
      onPress={props.onChange}
      style={styles.root}
      testID={testID}
    >
      <View style={styles.box} testID={testID && `${testID}-box`}>
        {checked ? (
          <Icon
            color={filled ? colors.onAccent : colors.accentText}
            name={filled ? "check" : "minus"}
            size={sizes.iconSm}
          />
        ) : null}
      </View>
      <Text.Body
        color={props.disabled ? colors.textSecondary : undefined}
        numberOfLines={1}
        value={props.label}
      />
    </Touchable>
  );
}

export default Checkbox;
