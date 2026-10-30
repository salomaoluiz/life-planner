import { Text as RNText, StyleSheet, View } from "react-native";

import Button from "@components/Button";
import Icon, { IconButton } from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface StatusBannerProps {
  actionLabel?: string;
  dismissLabel?: string;
  icon?: string;
  message: string;
  onAction?: () => void;
  onDismiss?: () => void;
  testID?: string;
}

const ICON = 18;

// Warning-toned notice for the top of a screen (spec 056): a message, an optional action and an
// optional dismiss. Announced politely to screen readers.
function StatusBanner(props: StatusBannerProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const styles = StyleSheet.create({
    actions: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    message: { ...typography.caption, color: colors.textPrimary, flex: 1 },
    root: {
      alignItems: "center",
      backgroundColor: colors.warningSoft,
      borderRadius: radius.md,
      flexDirection: "row",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  });
  const { testID } = props;

  return (
    <View
      accessibilityLiveRegion="polite"
      role="status"
      style={styles.root}
      testID={testID}
    >
      <Icon color={colors.warning} name={props.icon ?? "update"} size={ICON} />
      <RNText style={styles.message}>{props.message}</RNText>
      <View style={styles.actions}>
        {props.onAction && props.actionLabel ? (
          <Button.Primary
            label={props.actionLabel}
            onPress={props.onAction}
            testID={testID && `${testID}-action`}
          />
        ) : null}
        {props.onDismiss ? (
          <IconButton
            accessibilityLabel={props.dismissLabel ?? "Dismiss"}
            name="close"
            onPress={props.onDismiss}
            testID={testID && `${testID}-dismiss`}
          />
        ) : null}
      </View>
    </View>
  );
}

export default StatusBanner;
