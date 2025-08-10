import * as Paper from "react-native-paper";

export interface FabProps {
  icon: string;
  label?: string;
  onPress: () => void;
  testID?: string;
}

function Fab(props: FabProps) {
  return (
    <Paper.FAB
      icon={props.icon}
      label={props.label}
      onPress={props.onPress}
      testID={props.testID}
    />
  );
}

export default Fab;
