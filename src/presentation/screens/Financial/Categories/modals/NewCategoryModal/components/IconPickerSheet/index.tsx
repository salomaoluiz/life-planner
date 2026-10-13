import { View } from "react-native";

import { BottomSheet, IconChoiceGroup, SearchField } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";

interface Props {
  closeLabel: string;
  color: string;
  icons: { label: string; value: string }[];
  onClose: () => void;
  onQueryChange: (text: string) => void;
  onSelect: (value: string) => void;
  query: string;
  searchPlaceholder: string;
  selected: string;
  title: string;
}

function IconPickerSheet(props: Props) {
  const { spacing } = useKitTheme();

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      title={props.title}
      visible
    >
      <View style={{ gap: spacing.md }}>
        <SearchField
          clearLabel={props.closeLabel}
          onChangeText={props.onQueryChange}
          placeholder={props.searchPlaceholder}
          value={props.query}
        />
        <IconChoiceGroup
          color={props.color}
          label={props.title}
          onChange={props.onSelect}
          options={props.icons}
          testID={"icon-picker"}
          value={props.selected}
        />
      </View>
    </BottomSheet>
  );
}

export default IconPickerSheet;
