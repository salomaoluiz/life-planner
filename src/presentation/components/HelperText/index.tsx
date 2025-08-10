import * as Paper from "react-native-paper";

export interface HelperTextProps {
  label: string;
  type: "error" | "info";
  visible?: boolean;
  testID?: string;
}

function HelperText(props: HelperTextProps) {
  if (!props.visible) {
    return null;
  }

  return (
    <Paper.HelperText type={props.type} testID={props.testID}>
      {props.label}
    </Paper.HelperText>
  );
}

export default HelperText;
