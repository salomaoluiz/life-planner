import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { colors as palette } from "@presentation/theme/constants";

export interface CameraViewportProps {
  /** The live preview and what is drawn over it (torch button) */
  children?: ReactNode;
  /** Fixed height; omitted = fills its parent */
  height?: number;
  /** Framing rectangle drawn over the preview */
  showGuide?: boolean;
  testID?: string;
}

const GUIDE_RADIUS = 16;

// A dark, rounded frame for a camera preview with an optional framing guide (spec 121). Dark in every theme.
function CameraViewport(props: CameraViewportProps) {
  const { radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    guide: {
      alignSelf: "center",
      borderColor: palette.dark.textPrimary,
      borderRadius: GUIDE_RADIUS,
      borderWidth: 3,
      height: "50%",
      maxWidth: 300,
      width: "75%",
    },
    root: {
      alignItems: "center",
      backgroundColor: palette.light.textPrimary,
      borderRadius: radius.md,
      flex: props.height ? undefined : 1,
      gap: spacing.md,
      height: props.height,
      justifyContent: "center",
      overflow: "hidden",
      padding: spacing.md,
    },
  });

  return (
    <View style={styles.root} testID={props.testID}>
      {props.children}
      {props.showGuide ? <View style={styles.guide} /> : null}
    </View>
  );
}

export default CameraViewport;
