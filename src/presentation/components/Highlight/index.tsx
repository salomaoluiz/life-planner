import { ReactNode } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface HighlightProps {
  /** Tints the content (the soft income tone, or the favorite's warning tone) while true */
  active?: boolean;
  children: ReactNode;
  /** Takes the free space of a row, so tinted and plain cells stay the same width (spec 094.2) */
  fill?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  testID?: string;
  tone?: "income" | "warning";
}

// A row that blinks after something happened to it (spec 048 FR 29: the value just matched).
function Highlight(props: HighlightProps) {
  const { colors } = useKitTheme();
  const styles = StyleSheet.create({
    active: {
      backgroundColor:
        props.tone === "warning" ? colors.warningSoft : colors.incomeSoft,
    },
    fill: { flex: 1 },
  });

  return (
    <View
      onLayout={props.onLayout}
      style={[props.active && styles.active, props.fill && styles.fill]}
      testID={props.testID}
    >
      {props.children}
    </View>
  );
}

export default Highlight;
