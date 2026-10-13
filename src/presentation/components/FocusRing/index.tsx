import { View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface FocusRingProps {
  color?: string;
  radius: number;
  visible: boolean;
  width?: number;
}

const DEFAULT_WIDTH = 4;

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
        borderColor: props.color ?? colors.focusRing,
        borderRadius: props.radius + width,
        borderWidth: width,
        bottom: -width,
        left: -width,
        position: "absolute",
        right: -width,
        top: -width,
      }}
      testID="focus-ring"
    />
  );
}

export default FocusRing;
