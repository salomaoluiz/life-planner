import { ScrollView, View } from "react-native";

import { useSheetLayout } from "@components/BottomSheet/SheetLayoutContext";

import useStyles from "./styles";

export interface FormColumnsProps {
  // Gap of the single stack (compact / dialog); defaults to the form's `md`.
  compactGap?: "lg" | "md";
  left: React.ReactNode;
  leftFlex?: number;
  leftPaneTestID?: string;
  leftWidth?: number;
  right: React.ReactNode;
  // Fluid sheet only (spec 048 FR 28): the proportion of the panes and their test ids.
  rightFlex?: number;
  rightPaneTestID?: string;
  // Only used to derive `${testID}-column-left` / `-column-right`.
  testID?: string;
}

// Two columns inside a wide `form` BottomSheet, one vertical stack everywhere
// else. The tree is identical in both modes so inputs keep focus and state.
function FormColumns(props: FormColumnsProps) {
  const { columns, fluid } = useSheetLayout();
  const styles = useStyles(columns, props.leftWidth, props.compactGap, {
    fluid,
    leftFlex: props.leftFlex,
    rightFlex: props.rightFlex,
  });
  const { testID } = props;

  // Spec 048 FR 28: the left pane scrolls; the right one stays in view and scrolls only when it is taller.
  if (fluid) {
    return (
      <View style={styles.fluidRoot}>
        <ScrollView
          contentContainerStyle={styles.fluidContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.fluidLeft}
          testID={props.leftPaneTestID}
        >
          <View testID={testID && `${testID}-column-left`}>{props.left}</View>
        </ScrollView>
        <ScrollView
          contentContainerStyle={styles.fluidContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.fluidRight}
          testID={props.rightPaneTestID}
        >
          <View testID={testID && `${testID}-column-right`}>{props.right}</View>
        </ScrollView>
      </View>
    );
  }

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
