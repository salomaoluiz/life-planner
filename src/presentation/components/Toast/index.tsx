import { useEffect, useRef } from "react";
import { Text as RNText, StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ToastProps {
  /** Distance from the bottom of the parent. @default spacing.md */
  bottom?: number;
  /** @default 3000 */
  durationMs?: number;
  message: string;
  onHide: () => void;
  testID?: string;
  visible: boolean;
}

const DEFAULT_DURATION_MS = 3000;
const CHECK = 18;
const MAX_WIDTH = 420;

// Short confirmation that hides by itself. The caller places it (it is absolute, inside a positioned parent).
function Toast(props: ToastProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const onHideRef = useRef(props.onHide);
  onHideRef.current = props.onHide;
  const durationMs = props.durationMs ?? DEFAULT_DURATION_MS;

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    const timer = setTimeout(() => onHideRef.current(), durationMs);

    return () => clearTimeout(timer);
  }, [props.visible, durationMs]);

  const styles = StyleSheet.create({
    message: { ...typography.body, color: colors.surface, flexShrink: 1 },
    root: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.textPrimary,
      borderRadius: radius.md,
      boxShadow: `0 8px 24px ${colors.scrim}`,
      flexDirection: "row",
      gap: spacing.xs,
      maxWidth: MAX_WIDTH,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    wrapper: {
      bottom: props.bottom ?? spacing.md,
      left: spacing.md,
      position: "absolute",
      right: spacing.md,
    },
  });

  if (!props.visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={styles.wrapper}
      testID={props.testID && `${props.testID}-wrapper`}
    >
      <View
        accessibilityLiveRegion="polite"
        role="status"
        style={styles.root}
        testID={props.testID}
      >
        <Icon color={colors.income} name="check" size={CHECK} />
        <RNText style={styles.message}>{props.message}</RNText>
      </View>
    </View>
  );
}

export default Toast;
