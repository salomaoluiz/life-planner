import { useEffect, useRef } from "react";
import { Pressable, Text as RNText, StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ToastProps {
  /** Label of the optional action; it shows only together with `onAction`. */
  actionLabel?: string;
  /** Testing id of the action button. */
  actionTestID?: string;
  /** Distance from the bottom of the parent. @default spacing.md */
  bottom?: number;
  /** @default 3000 */
  durationMs?: number;
  /** Leading icon; the default check marks a success, any other one is neutral. @default "check" */
  icon?: string;
  message: string;
  /** Makes the toast tappable: the action button calls it. */
  onAction?: () => void;
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
    action: {
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: spacing.xs,
    },
    actionLabel: {
      ...typography.body,
      color: colors.surface,
      fontWeight: "600",
    },
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
      pointerEvents={props.onAction ? "box-none" : "none"}
      style={styles.wrapper}
      testID={props.testID && `${props.testID}-wrapper`}
    >
      <View
        accessibilityLiveRegion="polite"
        role="status"
        style={styles.root}
        testID={props.testID}
      >
        <Icon
          color={props.icon ? colors.surface : colors.income}
          name={props.icon ?? "check"}
          size={CHECK}
        />
        <RNText style={styles.message}>{props.message}</RNText>
        {props.onAction && props.actionLabel ? (
          <Pressable
            accessibilityRole={"button"}
            onPress={props.onAction}
            style={styles.action}
            testID={props.actionTestID}
          >
            <RNText style={styles.actionLabel}>{props.actionLabel}</RNText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default Toast;
