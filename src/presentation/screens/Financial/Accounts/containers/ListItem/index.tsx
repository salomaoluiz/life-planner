import { View } from "react-native";

import { Text } from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useTheme } from "@presentation/theme";

import useListItem, { Props } from "./hooks";
import { getStyles } from "./styles";

function ListItem(props: Props) {
  const { theme } = useTheme();
  const { styles } = getStyles();
  const { onDelete, onEdit } = useListItem(props);

  const isArchived = props.item.status === "ARCHIVED";
  const textColor = isArchived ? theme.colors.outline : undefined;

  return (
    <View style={[styles.container, isArchived && styles.archivedContainer]}>
      <View style={styles.iconColumn}>
        <Icon
          color={isArchived ? theme.colors.outline : theme.colors.primary}
          name={props.item.icon}
          size={theme.sizes.spacing.large}
        />
      </View>
      <View style={styles.detailsColumn}>
        <Text.Title
          color={textColor}
          numberOfLines={1}
          value={props.item.name}
        />
        <Text.Body
          color={textColor}
          numberOfLines={1}
          value={props.item.ownerName}
        />
      </View>
      <View style={styles.balanceColumn}>
        <Text.Headline
          color={textColor}
          numberOfLines={1}
          value={props.item.formattedBalance}
        />
        {isArchived && (
          <Text.Caption bold color={theme.colors.error} value={"Archived"} />
        )}
      </View>
      <View style={styles.actionColumn}>
        <IconButton
          name={"pencil"}
          onPress={onEdit}
          size={theme.sizes.spacing.large}
        />
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
