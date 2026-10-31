import { ActivityIndicator } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface SpinnerProps {
  accessibilityLabel?: string;
  testID?: string;
}

// Small inline activity indicator (a pending chip, a total being refreshed).
function Spinner(props: SpinnerProps) {
  const { colors } = useKitTheme();

  return (
    <ActivityIndicator
      accessibilityLabel={props.accessibilityLabel}
      color={colors.accent}
      size={"small"}
      testID={props.testID}
    />
  );
}

export default Spinner;
