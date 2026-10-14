import { View } from "react-native";

import { Button } from "@components";
import { IconButton } from "@components/Icon";
import useStyles from "@screens/Financial/Transactions/styles";

interface Props {
  monthLabel: string;
  nextLabel: string;
  nextTestID?: string;
  onMonthPress: () => void;
  onNext: () => void;
  onPrevious: () => void;
  previousLabel: string;
  previousTestID?: string;
}

function MonthSwitcher(props: Props) {
  const { styles } = useStyles();

  return (
    <View style={styles.monthSwitcher}>
      <IconButton
        accessibilityLabel={props.previousLabel}
        name={"chevron-left"}
        onPress={props.onPrevious}
        testID={props.previousTestID}
      />
      <Button.Ghost label={props.monthLabel} onPress={props.onMonthPress} />
      <IconButton
        accessibilityLabel={props.nextLabel}
        name={"chevron-right"}
        onPress={props.onNext}
        testID={props.nextTestID}
      />
    </View>
  );
}

export default MonthSwitcher;
