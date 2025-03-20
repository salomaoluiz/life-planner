import { View } from "react-native";

import { useTheme } from "@presentation/theme";
import { lightTheme } from "@presentation/theme/provider";

export interface SpacerProps {
  direction: "both" | "horizontal" | "vertical";
  size: "full" | keyof typeof lightTheme.sizes.spacing;
}

function getStyles(props: SpacerProps) {
  const { theme } = useTheme();
  const size = props.size === "full" ? "100%" : theme.sizes.spacing[props.size];

  const direction = {};

  switch (props.direction) {
    case "both":
      Object.assign(direction, { height: size, width: size });
      break;
    case "horizontal":
      Object.assign(direction, { width: size });
      break;
    case "vertical":
      Object.assign(direction, { height: size });
      break;
  }

  return {
    direction,
  };
}

function Spacer(props: SpacerProps) {
  const { direction } = getStyles(props);
  return <View style={{ ...direction }} />;
}

export default Spacer;
