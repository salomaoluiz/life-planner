import { useEffect, useState } from "react";
import { Switch as SwitchPaper } from "react-native-paper";

import getStyles from "./styles";

export interface SwitchProps {
  initialStatus: boolean;
  onToggle: (status: boolean) => void;
  testID?: string;
}

function Switch(props: SwitchProps) {
  const { initialStatus, onToggle, testID } = props;
  const [isEnabled, setIsEnabled] = useState(initialStatus);
  const { styles, switchColors } = getStyles();

  // The parent owns the real value (e.g. fresh server data); follow it after mount.
  useEffect(() => {
    setIsEnabled(initialStatus);
  }, [initialStatus]);

  function onValueChange(value: boolean) {
    setIsEnabled(value);
    onToggle(value);
  }

  return (
    <SwitchPaper
      color={switchColors.trackColorTrue}
      onValueChange={onValueChange}
      style={styles.switch}
      testID={testID}
      value={isEnabled}
    />
  );
}

export default Switch;
