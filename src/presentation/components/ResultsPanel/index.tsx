import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface ResultsPanelProps {
  children: React.ReactNode;
  // Wide: the panel floats under its field; otherwise it sits inline.
  floating?: boolean;
  testID?: string;
}

// The bordered box that lists search results (spec 051): a dropdown on wide screens, inline on compact.
function ResultsPanel(props: ResultsPanelProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    floating: {
      elevation: 4,
      left: 0,
      position: "absolute",
      right: 0,
      shadowColor: colors.scrim,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      top: "100%",
      zIndex: 2,
    },
    root: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      marginTop: spacing.xxs,
      padding: spacing.xxs,
    },
  });

  return (
    <View
      style={[styles.root, props.floating ? styles.floating : undefined]}
      testID={props.testID}
    >
      {props.children}
    </View>
  );
}

export default ResultsPanel;
