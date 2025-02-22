import { Switch as SwitchPaper } from "react-native-paper";
import { useState } from "react";
import { styles } from "./styles";

export interface SwitchProps {
  initialStatus: boolean;
  onToggle: (status: boolean) => void;
  testID: string;
}

const Switch = (props: SwitchProps) => {
  const { initialStatus, onToggle, testID } = props;
  const [isEnabled, setIsEnabled] = useState(initialStatus);

  const onValueChange = (value: boolean) => {
    setIsEnabled(value);
    onToggle(value);
  };

  return (
    <SwitchPaper
      testID={testID}
      value={isEnabled}
      onValueChange={onValueChange}
      style={styles.switch}
    />
  );
};

export default Switch;
