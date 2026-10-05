import { View } from "react-native";

import { BottomSheet, ChipGroup, Text } from "@components";
import { IconButton } from "@components/Icon";

import useStyles from "../../styles";

interface Props {
  closeLabel: string;
  months: { label: string; value: string }[];
  nextYearLabel: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  onYearChange: (delta: number) => void;
  previousYearLabel: string;
  selected?: string;
  title: string;
  year: number;
}

function MonthPickerSheet(props: Props) {
  const { styles } = useStyles();

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      title={props.title}
      visible
    >
      <View style={styles.monthSwitcher}>
        <IconButton
          accessibilityLabel={props.previousYearLabel}
          name={"chevron-left"}
          onPress={() => props.onYearChange(-1)}
        />
        <Text.Heading value={String(props.year)} />
        <IconButton
          accessibilityLabel={props.nextYearLabel}
          name={"chevron-right"}
          onPress={() => props.onYearChange(1)}
        />
      </View>
      <ChipGroup
        layout={"wrap"}
        mode={"single"}
        onChange={props.onSelect}
        options={props.months}
        value={props.selected}
      />
    </BottomSheet>
  );
}

export default MonthPickerSheet;
