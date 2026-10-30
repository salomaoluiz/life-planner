import { StyleSheet, View } from "react-native";

import { getToneColors, Tone } from "@components/utils/tones";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ToneDotProps {
  accessibilityLabel?: string;
  testID?: string;
  tone: Tone;
}

const DOT = 8;

/** A small solid bullet in a tone color, e.g. expense / income at the end of a row. */
function ToneDot(props: ToneDotProps) {
  const { colors, radius } = useKitTheme();
  const styles = StyleSheet.create({
    root: {
      backgroundColor: getToneColors(colors)[props.tone].foreground,
      borderRadius: radius.full,
      height: DOT,
      width: DOT,
    },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      style={styles.root}
      testID={props.testID}
    />
  );
}

export default ToneDot;
