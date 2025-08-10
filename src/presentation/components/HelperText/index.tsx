import * as Paper from "react-native-paper";

export interface HelperTextProps {
  label: string;
  testID?: string;
  type: "error" | "info";
  visible?: boolean;
}

function HelperText(props: HelperTextProps) {
  if (!props.visible) {
    return null;
  }

  return (
    <Paper.HelperText testID={props.testID} type={props.type}>
      {props.label}
    </Paper.HelperText>
  );
}

export default HelperText;
