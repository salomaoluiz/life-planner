import { View } from "react-native";

import { Button, Text } from "@components";
import useStyles from "@screens/Financial/Transactions/modals/NewTransactionModal/styles";

interface Props {
  actionLabel: string;
  message: string;
  onCreate: () => void;
  testID?: string;
}

function MissingRecordHint(props: Props) {
  const { styles } = useStyles();

  return (
    <View style={styles.hint} testID={props.testID}>
      <Text.Caption tone={"secondary"} value={props.message} />
      <Button.Ghost inline label={props.actionLabel} onPress={props.onCreate} />
    </View>
  );
}

export default MissingRecordHint;
