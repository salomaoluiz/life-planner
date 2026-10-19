import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

export interface TooltipProps {
  children: ReactNode;
  /** What the bubble shows; no content = no tooltip */
  content?: ReactNode;
  testID?: string;
}

// Web only: the bubble shows under the children while the pointer is over them. Native renders the children as they are.
function Tooltip(props: TooltipProps) {
  const { colors, radius, spacing } = useKitTheme();
  const [visible, setVisible] = useState(false);
  const styles = StyleSheet.create({
    anchor: { zIndex: 10 },
    bubble: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      boxShadow: `0 12px 32px ${colors.scrim}`,
      marginTop: spacing.xxs,
      padding: spacing.sm,
      position: "absolute",
      right: 0,
      top: "100%",
      width: 300,
      zIndex: 20,
    },
  });

  if (!isWeb() || !props.content) {
    return <>{props.children}</>;
  }

  return (
    <Pressable
      accessible={false}
      focusable={false}
      onHoverIn={() => setVisible(true)}
      onHoverOut={() => setVisible(false)}
      style={styles.anchor}
    >
      {props.children}
      {visible && (
        <View pointerEvents="none" style={styles.bubble} testID={props.testID}>
          {props.content}
        </View>
      )}
    </Pressable>
  );
}

export default Tooltip;
