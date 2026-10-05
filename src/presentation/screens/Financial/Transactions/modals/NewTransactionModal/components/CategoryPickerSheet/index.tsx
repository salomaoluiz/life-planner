import { ScrollView } from "react-native";

import {
  BottomSheet,
  Icon,
  IconTile,
  SearchField,
  TreeItem,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import {
  CategoryTreeRow,
  filterRowsByQuery,
} from "@screens/Financial/models/categoryTree";

interface Props {
  closeLabel: string;
  onClose: () => void;
  onQueryChange: (text: string) => void;
  onSelect: (id: string) => void;
  query: string;
  rows: CategoryTreeRow[];
  searchLabel?: string;
  searchPlaceholder: string;
  selected?: string;
  title: string;
}

function CategoryPickerSheet(props: Props) {
  const { sizes } = useKitTheme();
  const rows = filterRowsByQuery(props.rows, props.query);

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      title={props.title}
      visible
    >
      <SearchField
        clearLabel={props.closeLabel}
        onChangeText={props.onQueryChange}
        placeholder={props.searchPlaceholder}
        value={props.query}
      />
      <ScrollView keyboardShouldPersistTaps={"handled"}>
        {rows.map((row) => (
          <TreeItem
            depth={row.depth}
            key={row.category.id}
            leading={
              <IconTile
                color={normalizeCategoryColor(row.category.iconColor)}
                name={row.category.icon}
              />
            }
            onPress={() => props.onSelect(row.category.id)}
            testID={`category-option-${row.category.id}`}
            title={row.category.name}
            trailing={
              props.selected === row.category.id ? (
                <Icon
                  name={"check"}
                  size={sizes.iconMd}
                  testID={`category-option-${row.category.id}-selected`}
                />
              ) : undefined
            }
          />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

export default CategoryPickerSheet;
