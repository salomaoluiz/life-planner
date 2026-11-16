import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface ColorDotProps {
  accessibilityLabel?: string;
  /** A data colour (the class of an asset in the investments charts), not a theme token */
  color: string;
  size?: number;
  testID?: string;
}

const DEFAULT_SIZE = 12;

/** A small rounded square that ties a row to a slice or a bar of a chart. */
function ColorDot(props: ColorDotProps) {
  const { radius } = useKitTheme();
  const size = props.size ?? DEFAULT_SIZE;
  const styles = StyleSheet.create({
    root: {
      backgroundColor: props.color,
      borderRadius: radius.sm / 2.5,
      flexShrink: 0,
      height: size,
      width: size,
    },
  });

  return (
    <View
      accessibilityElementsHidden={!props.accessibilityLabel}
      accessibilityLabel={props.accessibilityLabel}
      style={styles.root}
      testID={props.testID}
    />
  );
}

export default ColorDot;
