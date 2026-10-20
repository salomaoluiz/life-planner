import { View } from "react-native";

import { useSheetLayout } from "@components/BottomSheet/SheetLayoutContext";

import useStyles from "./styles";

export interface FormColumnsProps {
  // Gap of the single stack (compact / dialog); defaults to the form's `md`.
  compactGap?: "lg" | "md";
  left: React.ReactNode;
  leftWidth?: number;
  right: React.ReactNode;
  // Only used to derive `${testID}-column-left` / `-column-right`.
  testID?: string;
}

// Two columns inside a wide `form` BottomSheet, one vertical stack everywhere
// else. The tree is identical in both modes so inputs keep focus and state.
function FormColumns(props: FormColumnsProps) {
  const { columns } = useSheetLayout();
  const styles = useStyles(columns, props.leftWidth, props.compactGap);
  const { testID } = props;

  return (
    <View style={styles.root}>
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
