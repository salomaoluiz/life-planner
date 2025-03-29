import { View } from "react-native";

import { useTheme } from "@presentation/theme";
import { lightTheme } from "@presentation/theme/provider";

export interface SpacerProps {
  direction: "both" | "horizontal" | "vertical";
  horizontalLine?: boolean;
  size: "flex" | "full" | keyof typeof lightTheme.sizes.spacing;
}

function getSize(size: SpacerProps["size"], theme: typeof lightTheme) {
  if (size === "full") {
    return { size: "100%" };
  }

  if (size === "flex") {
    return { flex: 1, size: "auto" };
  }

  return { size: theme.sizes.spacing[size] };
}
function getStyles(props: SpacerProps, theme: typeof lightTheme) {
  const { flex, size } = getSize(props.size, theme);

  const direction = {
    flex,
  };

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
  const { theme } = useTheme();
  const { direction } = getStyles(props, theme);
  return (
    <View style={{ ...direction }}>
      {props.horizontalLine ? (
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: theme.colors.onBackground,
            height: 1,
            marginHorizontal: theme.sizes.spacing.small,
          }}
        />
      ) : null}
    </View>
  );
}

export default Spacer;
