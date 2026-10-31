import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface TooltipAnchor {
  bottom: number;
  right: number;
}

export interface TooltipBubbleProps {
  // Where the children are on the page; only the web bubble uses it.
  anchor?: TooltipAnchor;
  children: ReactNode;
  testID?: string;
}

const BUBBLE_WIDTH = 300;

// Native and tests: the bubble sits under the children. On the web `TooltipBubble.web.tsx` takes over.
function TooltipBubble(props: TooltipBubbleProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    bubble: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      marginTop: spacing.xxs,
      padding: spacing.sm,
      position: "absolute",
      right: 0,
      top: "100%",
      width: BUBBLE_WIDTH,
      zIndex: 20,
    },
  });

  return (
    <View pointerEvents="none" style={styles.bubble} testID={props.testID}>
      {props.children}
    </View>
  );
}

export { BUBBLE_WIDTH };
export default TooltipBubble;
