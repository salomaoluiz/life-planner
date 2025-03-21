import * as Paper from "react-native-paper";

export interface HelperTextProps {
  label: string;
  type: "error" | "info";
  visible?: boolean;
}

function HelperText(props: HelperTextProps) {
  if (!props.visible) {
    return null;
  }

  return <Paper.HelperText type={props.type}>{props.label}</Paper.HelperText>;
}

export default HelperText;
