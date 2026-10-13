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

import { isKeyboardFocus } from "./focusVisible";
import useStyles from "./styles";

export interface TouchableProps {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole: AccessibilityRole;
  busy?: boolean;
  children: React.ReactNode;
  /** Set false when the caller paints its own disabled look (default: dim to 50%) */
  dimWhenDisabled?: boolean;
  disabled?: boolean;
  focusRadius?: number;
  /** Ring color; pass a contrasting one on accent-filled controls (default: accent) */
  focusRingColor?: string;
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
      onFocus={(event) => setFocused(isKeyboardFocus(event))}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onLongPress={props.onLongPress}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.root,
        props.style,
        !!props.disabled && props.dimWhenDisabled !== false && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      testID={props.testID}
    >
      {onWeb && hovered && !disabled && (
        <View pointerEvents="none" style={styles.hover} />
      )}
      {props.children}
      <FocusRing
        color={props.focusRingColor}
        radius={props.focusRadius ?? radius.md}
        visible={onWeb && focused}
      />
    </Pressable>
  );
}

export default Touchable;
