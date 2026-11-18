import { StyleSheet } from "react-native";
import { Icon as PaperIcon } from "react-native-paper";

import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface IconButtonProps {
  accessibilityLabel: string;
  /** Legacy, kept until spec 014: defaults to textPrimary */
  color?: string;
  /** Press duration (ms) of `onLongPress` */
  delayLongPress?: number;
  disabled?: boolean;
  name: string;
  /** Web: right click (spec 117) */
  onContextMenu?: () => void;
  onLongPress?: () => void;
  onPress: () => void;
  /** Legacy, kept until spec 014: defaults to iconMd */
  size?: number;
  testID?: string;
  variant?: "plain" | "raised";
}

export interface IconProps {
  color?: string;
  name: string;
  size: number;
  testID?: string;
}

function Icon({ color, name, size, testID }: IconProps) {
  return <PaperIcon color={color} size={size} source={name} testID={testID} />;
}

function IconButton(props: IconButtonProps) {
  const { colors, radius, sizes } = useKitTheme();
  const styles = StyleSheet.create({
    base: {
      alignItems: "center",
      borderRadius: radius.full,
      height: sizes.touchTarget,
      justifyContent: "center",
      width: sizes.touchTarget,
    },
    raised: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderWidth: 1,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      delayLongPress={props.delayLongPress}
      disabled={props.disabled}
      focusRadius={radius.full}
      onContextMenu={props.onContextMenu}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
      style={[
        styles.base,
        props.variant === "plain" ? undefined : styles.raised,
      ]}
      testID={props.testID}
    >
      <Icon
        color={props.color ?? colors.textPrimary}
        name={props.name}
        size={props.size ?? sizes.iconMd}
      />
    </Touchable>
  );
}

export default Icon;
export { IconButton };
