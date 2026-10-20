import { View } from "react-native";

import { useSheetLayout } from "@components/BottomSheet/SheetLayoutContext";

import useStyles from "./styles";

export interface FormColumnsProps {
  left: React.ReactNode;
  leftWidth?: number;
  right: React.ReactNode;
  testID?: string;
}

// Two columns inside a wide `form` BottomSheet, one vertical stack everywhere
// else. The tree is identical in both modes so inputs keep focus and state.
function FormColumns(props: FormColumnsProps) {
  const { columns } = useSheetLayout();
  const styles = useStyles(columns, props.leftWidth);
  const { testID } = props;

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.left} testID={testID && `${testID}-column-left`}>
        {props.left}
      </View>
      <View style={styles.right} testID={testID && `${testID}-column-right`}>
        {props.right}
      </View>
    </View>
  );
}

export default FormColumns;
