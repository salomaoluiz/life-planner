import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface RemovableChipProps {
  // A color bullet before the label (the category color, spec 051).
  dotColor?: string;
  label: string;
  onRemove: () => void;
  removeLabel: string;
  testID?: string;
}

const CHIP_HEIGHT = 32;
const DOT_SIZE = 10;
const REMOVE_SLOP = 8;

// An active filter: the pill with its text and an x that removes it (the x reaches 44 px with hitSlop).
function RemovableChip(props: RemovableChipProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    dot: {
      backgroundColor: props.dotColor,
      borderRadius: radius.full,
      height: DOT_SIZE,
      width: DOT_SIZE,
    },
    root: {
      alignItems: "center",
      backgroundColor: colors.accentSoft,
      borderRadius: radius.full,
      flexDirection: "row",
      gap: spacing.xxs,
      height: CHIP_HEIGHT,
      paddingHorizontal: spacing.sm,
    },
  });

  return (
    <View style={styles.root} testID={testID}>
      {props.dotColor ? (
        <View
          accessibilityElementsHidden
          style={styles.dot}
          testID={testID && `${testID}-dot`}
        />
      ) : null}
      <Text.Body
        color={colors.accentText}
        numberOfLines={1}
        value={props.label}
      />
      <Touchable
        accessibilityLabel={props.removeLabel}
        accessibilityRole="button"
        focusRadius={radius.full}
        hitSlop={{
          bottom: REMOVE_SLOP,
          left: REMOVE_SLOP,
          right: REMOVE_SLOP,
          top: REMOVE_SLOP,
        }}
        minTouchTarget={false}
        onPress={props.onRemove}
        testID={testID && `${testID}-remove`}
      >
        <Icon color={colors.accentText} name="close" size={sizes.iconSm} />
      </Touchable>
    </View>
  );
}

export default RemovableChip;
