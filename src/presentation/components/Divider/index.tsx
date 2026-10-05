import { View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface DividerProps {
  inset?: boolean;
  testID?: string;
}

const INSET = 52;

function Divider(props: DividerProps) {
  const { colors } = useKitTheme();

  return (
    <View
      accessibilityRole="none"
      style={{
        backgroundColor: colors.border,
        height: 1,
        marginLeft: props.inset ? INSET : 0,
      }}
      testID={props.testID}
    />
  );
}

export default Divider;
