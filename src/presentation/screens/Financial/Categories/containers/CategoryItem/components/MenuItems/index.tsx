import React from "react";
import { View } from "react-native";

import { Menu } from "@components";
import { useTranslation } from "@presentation/i18n";

import getStyles from "./styles";

interface Props {
  onDelete: () => void;
  onEdit: () => void;
}

function MenuItems(props: Props) {
  const { styles } = getStyles();
  const { t } = useTranslation();
  const { onDelete, onEdit } = props;
  return (
    <View style={styles.container}>
      <Menu.Item onPress={onEdit} title={t("financial.categories.menu.edit")} />
      <Menu.Item
        onPress={onDelete}
        title={t("financial.categories.menu.delete")}
      />
    </View>
  );
}

export default MenuItems;
