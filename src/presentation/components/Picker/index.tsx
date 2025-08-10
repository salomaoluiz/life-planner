import { Picker as RNPicker } from "@react-native-picker/picker";
import { View } from "react-native";

import getStyles from "./styles";

export interface PickerItem<T> {
  label: string;
  value: T;
}

export interface PickerProps<T> {
  items: PickerItem<T>[];
  label?: string;
  onValueChange: (newValue: T) => void;
  selectedValue: T;
  testID?: string;
}

function Picker<T>(props: PickerProps<T>) {
  const { styles, theme } = getStyles();

  return (
    <View style={styles.container} testID={props.testID}>
      <RNPicker
        dropdownIconColor={theme.colors.onBackground}
        onValueChange={props.onValueChange}
        selectedValue={props.selectedValue}
        style={styles.picker}
      >
        {props.items.map((item, index) => (
          <RNPicker.Item
            key={index}
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
