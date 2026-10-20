import { View } from "react-native";

import Button from "@components/Button";
import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";

import useStyles from "./styles";

const ROW_ICON_SIZE = 22;
const CHEVRON_SIZE = 16;

export interface NavigationRailChild {
  label: string;
  path: string;
  testID: string;
}

export interface NavigationRailItem {
  children?: NavigationRailChild[];
  icon: string;
  label: string;
  routeName: string;
  testID: string;
}

export interface NavigationRailProps {
  activeChildPath?: string;
  activeRouteName: string;
  addLabel: string;
  appName: string;
  items: NavigationRailItem[];
  onAddPress: () => void;
  onChildPress?: (path: string) => void;
  onProfilePress: () => void;
  onTabPress: (routeName: string) => void;
  profileLabel: string;
  testID?: string;
}

function NavigationRail(props: NavigationRailProps) {
  const { styles, theme } = useStyles();

  function renderChild(child: NavigationRailChild) {
    const selected = child.path === props.activeChildPath;

    return (
      <Touchable
        accessibilityLabel={child.label}
        accessibilityRole={"tab"}
        key={child.path}
        onPress={() => props.onChildPress?.(child.path)}
        selected={selected}
        style={[styles.child, selected && styles.rowActive]}
        testID={child.testID}
      >
        {selected ? (
          <Text.BodyStrong
            color={theme.colors.accentText}
            value={child.label}
          />
        ) : (
          <Text.Body color={theme.colors.textSecondary} value={child.label} />
        )}
      </Touchable>
    );
  }

  function renderItem(item: NavigationRailItem) {
    const active = item.routeName === props.activeRouteName;
    const expandable = !!item.children?.length;
    const expanded = expandable && active;
    const highlighted = active && !expandable;
    const color = active ? theme.colors.accentText : theme.colors.textSecondary;

    return (
      <View key={item.routeName}>
        <Touchable
          accessibilityLabel={item.label}
          accessibilityRole={"tab"}
          expanded={expandable ? expanded : undefined}
          onPress={() => props.onTabPress(item.routeName)}
          selected={highlighted}
          style={[styles.row, highlighted && styles.rowActive]}
          testID={item.testID}
        >
          <Icon color={color} name={item.icon} size={ROW_ICON_SIZE} />
          <Text.Body color={color} value={item.label} />
          {expandable ? (
            <View style={styles.chevron}>
              <Icon
                color={theme.colors.textSecondary}
                name={expanded ? "chevron-up" : "chevron-down"}
                size={CHEVRON_SIZE}
              />
            </View>
          ) : null}
        </Touchable>
        {expanded ? item.children?.map(renderChild) : null}
      </View>
    );
  }

  return (
    <View style={styles.rail} testID={props.testID ?? "navigation-rail"}>
      <View style={styles.header}>
        <Text.Heading value={props.appName} />
        <Button.Primary
          fullWidth
          icon={"plus"}
          label={props.addLabel}
          onPress={props.onAddPress}
          testID={"navigation-rail-add"}
        />
      </View>
      {props.items.map(renderItem)}
      <View style={styles.spacer} />
      <Touchable
        accessibilityLabel={props.profileLabel}
        accessibilityRole={"button"}
        onPress={props.onProfilePress}
        style={styles.row}
        testID={"navigation-rail-profile"}
      >
        <Icon
          color={theme.colors.textSecondary}
          name={"account-circle-outline"}
          size={ROW_ICON_SIZE}
        />
        <Text.Body value={props.profileLabel} />
      </Touchable>
    </View>
  );
}

export default NavigationRail;
