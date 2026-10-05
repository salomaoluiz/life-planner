import { View } from "react-native";

import Icon from "@components/Icon";
import QuickAddButton from "@components/QuickAddButton";
import Text from "@components/Text";
import Touchable from "@components/Touchable";

import useStyles from "./styles";
import { TabBarItem, TabBarProps } from "./types";

const TAB_ICON_SIZE = 22;
const QUICK_ADD_POSITION = 2;

function TabBar(props: TabBarProps) {
  const { styles, theme } = useStyles();

  function renderTab(item: TabBarItem) {
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
        style={styles.column}
        testID={item.testID}
      >
        <Icon color={color} name={item.icon} size={TAB_ICON_SIZE} />
        <Text.Tab color={color} value={item.label} />
      </Touchable>
    );
  }

  return (
    <View style={styles.bar} testID={props.testID ?? "tab-bar"}>
      {props.items.slice(0, QUICK_ADD_POSITION).map(renderTab)}
      <View style={styles.column}>
        <QuickAddButton
          label={props.quickAddLabel}
          onPress={props.onQuickAddPress}
        />
      </View>
      {props.items.slice(QUICK_ADD_POSITION).map(renderTab)}
    </View>
  );
}

export default TabBar;
export { TabBarItem, TabBarProps } from "./types";
