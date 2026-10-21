import { ReactNode } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface HighlightProps {
  /** Tints the content (the soft income tone) while true */
  active?: boolean;
  children: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  testID?: string;
}

// A row that blinks after something happened to it (spec 048 FR 29: the value just matched).
function Highlight(props: HighlightProps) {
  const { colors } = useKitTheme();
  const styles = StyleSheet.create({
    active: { backgroundColor: colors.incomeSoft },
  });

  return (
    <View
      onLayout={props.onLayout}
      style={props.active ? styles.active : undefined}
      testID={props.testID}
    >
      {props.children}
    </View>
  );
}

export default Highlight;
