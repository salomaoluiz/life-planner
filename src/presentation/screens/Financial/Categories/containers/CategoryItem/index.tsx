import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Menu, Text } from "@components";
import Icon from "@components/Icon";
import Skeleton from "@components/Skeleton";
import Loading from "@screens/Financial/Categories/containers/CategoryItem/components/Loading";
import useCategoryItem from "@screens/Financial/Categories/containers/CategoryItem/useCategoryItem";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

import MenuItems from "./components/MenuItems";
import getStyles from "./styles";

export interface Props {
  category: CategoryViewModel;
  refetch: () => void;
}

function CategoryItem(props: Props) {
  const { category, refetch } = props;
  const { isFetching, menuVisible, onDelete, onEdit, onMenuPress } =
    useCategoryItem({
      category,
      refetch,
    });

  const { styles, theme } = getStyles({
    level: category.level,
    owner: category.ownerType,
  });

  const ownerIcon = category.ownerType === "USER" ? "account" : "account-group";

  if (isFetching) {
    return (
      <View style={[styles.container, styles.row]}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.row]}>
      <View style={[styles.row]}>
        <View style={styles.iconContainer}>
          <Icon
            color={styles.icon.color}
            name={category.icon}
            size={theme.sizes.spacing.medium}
            testID={`category-item-icon-${category.id}`}
          />
        </View>
        <Text.Body
          testID={`category-item-name-${category.id}`}
          value={props.category.name}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.ownerContainer}>
          <View style={[styles.ownerBackdrop]} />
          <View style={[styles.ownerIconContainer]}>
            <Icon
              color={styles.icon.color}
              name={ownerIcon}
              size={theme.sizes.spacing.small}
              testID={`category-item-owner-icon-${category.id}`}
            />
          </View>
          <Text.Caption bold color={styles.icon.color} value={category.owner} />
        </View>
        <Menu.Container
          items={<MenuItems onDelete={onDelete} onEdit={onEdit} />}
          onDismiss={onMenuPress}
          testID={`category-item-menu-${category.id}`}
          visible={menuVisible}
        >
          <Pressable
            onPress={onMenuPress}
            testID={`category-item-menu-button-${category.id}`}
          >
            <View style={styles.menuContainer}>
              <Icon
                color={theme.colors.onSurfaceVariant}
                name={"dots-vertical"}
                size={theme.sizes.spacing.medium}
              />
            </View>
          </Pressable>
        </Menu.Container>
      </View>
    </View>
  );
}

export default CategoryItem;
