import { useState } from "react";
import {
  AccessibilityRole,
  Insets,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

import FocusRing from "@components/FocusRing";
import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

import useStyles from "./styles";

export interface TouchableProps {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole: AccessibilityRole;
  busy?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  focusRadius?: number;
  hitSlop?: Insets;
  minTouchTarget?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function Touchable(props: TouchableProps) {
  const { radius } = useKitTheme();
  const { styles } = useStyles({
    minTouchTarget: props.minTouchTarget ?? true,
  });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const disabled = !!props.disabled || !!props.busy;
  const onWeb = isWeb();

  return (
    <Pressable
      accessibilityHint={props.accessibilityHint}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole={props.accessibilityRole}
      accessibilityState={{
        busy: !!props.busy,
        disabled: !!props.disabled || !!props.busy,
        selected: !!props.selected,
      }}
      disabled={disabled}
      hitSlop={props.hitSlop}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.root,
        props.style,
        !!props.disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      testID={props.testID}
    >
      {onWeb && hovered && !disabled && (
        <View pointerEvents="none" style={styles.hover} />
      )}
      {props.children}
      <FocusRing
        radius={props.focusRadius ?? radius.md}
        visible={onWeb && focused}
      />
    </Pressable>
  );
}

export default Touchable;
