import { Picker as RNPicker } from "@react-native-picker/picker";
import { View } from "react-native";

import getStyles from "./styles";

interface PickerItems<T> {
  label: string;
  value: T;
}

interface PickerProps<T> {
  items: PickerItems<T>[];
  label?: string;
  onValueChange: (newValue: T) => void;
  selectedValue: T;
}

function Picker<T>(props: PickerProps<T>) {
  const { styles, theme } = getStyles();

  return (
    <View style={styles.container}>
      <RNPicker
        dropdownIconColor={theme.colors.onBackground}
        onValueChange={props.onValueChange}
        selectedValue={props.selectedValue}
        style={styles.picker}
      >
        {props.items.map((item) => (
          <RNPicker.Item
            label={item.label}
            style={styles.itemStyle}
            value={item.value}
          />
        ))}
      </RNPicker>
    </View>
  );
}

export default Picker;
