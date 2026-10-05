import { View } from "react-native";

import { Button } from "@components";
import { IconButton } from "@components/Icon";

import useStyles from "../../styles";

interface Props {
  monthLabel: string;
  nextLabel: string;
  onMonthPress: () => void;
  onNext: () => void;
  onPrevious: () => void;
  previousLabel: string;
}

function MonthSwitcher(props: Props) {
  const { styles } = useStyles();

  return (
    <View style={styles.monthSwitcher}>
      <IconButton
        accessibilityLabel={props.previousLabel}
        name={"chevron-left"}
        onPress={props.onPrevious}
      />
      <Button.Ghost label={props.monthLabel} onPress={props.onMonthPress} />
      <IconButton
        accessibilityLabel={props.nextLabel}
        name={"chevron-right"}
        onPress={props.onNext}
      />
    </View>
  );
}

export default MonthSwitcher;
