import { View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface DividerProps {
  inset?: boolean;
  testID?: string;
  /** Full-height 1 px line, for splitting columns in a row */
  vertical?: boolean;
}

const INSET = 52;

function Divider(props: DividerProps) {
  const { colors } = useKitTheme();

  return (
    <View
      accessibilityRole="none"
      style={{
        backgroundColor: colors.border,
        marginLeft: props.inset ? INSET : 0,
        ...(props.vertical
          ? { alignSelf: "stretch", width: 1 }
          : { height: 1 }),
      }}
      testID={props.testID}
    />
  );
}

export default Divider;
