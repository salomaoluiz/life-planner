import { View } from "react-native";

import Button from "@components/Button";
import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";

import useStyles from "./styles";

const ROW_ICON_SIZE = 22;

export interface NavigationRailItem {
  icon: string;
  label: string;
  routeName: string;
  testID: string;
}

export interface NavigationRailProps {
  activeRouteName: string;
  addLabel: string;
  appName: string;
  items: NavigationRailItem[];
  onAddPress: () => void;
  onProfilePress: () => void;
  onTabPress: (routeName: string) => void;
  profileLabel: string;
  testID?: string;
}

function NavigationRail(props: NavigationRailProps) {
  const { styles, theme } = useStyles();

  function renderItem(item: NavigationRailItem) {
    const selected = item.routeName === props.activeRouteName;
    const color = selected
      ? theme.colors.accentText
      : theme.colors.textSecondary;

    return (
      <Touchable
        accessibilityLabel={item.label}
        accessibilityRole={"tab"}
        key={item.routeName}
        onPress={() => props.onTabPress(item.routeName)}
        selected={selected}
        style={[styles.row, selected && styles.rowActive]}
        testID={item.testID}
      >
        <Icon color={color} name={item.icon} size={ROW_ICON_SIZE} />
        <Text.Body color={color} value={item.label} />
      </Touchable>
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
