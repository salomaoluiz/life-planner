import { View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface FocusRingProps {
  color?: string;
  radius: number;
  visible: boolean;
  width?: number;
}

const DEFAULT_WIDTH = 2;

function FocusRing(props: FocusRingProps) {
  const { colors } = useKitTheme();
  const width = props.width ?? DEFAULT_WIDTH;

  if (!props.visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        // Inset, so no ancestor with overflow hidden (chip scroll rows) can clip it.
        borderColor: props.color ?? colors.accent,
        borderRadius: props.radius,
        borderWidth: width,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      }}
      testID="focus-ring"
    />
  );
}

export default FocusRing;
