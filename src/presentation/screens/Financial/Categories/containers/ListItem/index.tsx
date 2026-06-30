import { View } from "react-native";

import { Text } from "@components";
import Icon, { IconButton } from "@components/Icon";

import useListItem, { Props } from "./hooks";
import { getStyles } from "./styles";

function ListItem(props: Props) {
  const { styles, theme } = getStyles(props.item.depthLevel);
  const { onDelete } = useListItem(props);

  return (
    <View style={styles.container}>
      <View style={styles.iconColumn}>
        <Icon
          color={theme.colors.primary}
          name={props.item.icon}
          size={theme.sizes.spacing.large}
        />
      </View>
      <View style={styles.detailsColumn}>
        <Text.Title numberOfLines={1} value={props.item.name} />
        <Text.Body numberOfLines={1} value={props.item.ownerName} />
      </View>
      <View style={styles.deleteColumn}>
        <IconButton
          name={"delete"}
          onPress={onDelete}
          size={theme.sizes.spacing.large}
        />
      </View>
    </View>
  );
}

export default ListItem;
