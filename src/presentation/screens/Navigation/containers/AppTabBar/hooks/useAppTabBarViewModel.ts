import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { router } from "expo-router";

import { TabBarItem } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import {
  NAVIGATION_ITEMS,
  QUICK_ADD_PATH,
  SETTINGS_PATH,
} from "@screens/Navigation/models/navigationItems";

function useAppTabBarViewModel({ navigation, state }: BottomTabBarProps) {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();

  const activeRouteName = state.routes[state.index].name;

  const items: TabBarItem[] = NAVIGATION_ITEMS.map((item) => ({
    icon: item.icon,
    label: t(item.labelKey),
    routeName: item.routeName,
    testID: item.testID,
  }));

  function onTabPress(routeName: string) {
    const route = state.routes.find(
      (candidate) => candidate.name === routeName,
    );
    if (!route) {
      return;
    }

    const event = navigation.emit({
      canPreventDefault: true,
      target: route.key,
      type: "tabPress",
    });

    if (route.name !== activeRouteName && !event.defaultPrevented) {
      navigation.dispatch({
        ...CommonActions.navigate(route.name, route.params),
        target: state.key,
      });
    }
  }

  function onAddPress() {
    router.push(QUICK_ADD_PATH as never);
  }

  function onProfilePress() {
    router.push(SETTINGS_PATH as never);
  }

  return {
    activeRouteName,
    isWide: breakpoint === "expanded",
    items,
    onAddPress,
    onProfilePress,
    onTabPress,
    texts: {
      addLabel: t("navigation.quickAdd.button"),
      appName: t("navigation.appName"),
      profileLabel: t("navigation.profileAndSettings"),
      quickAddLabel: t("navigation.quickAdd.button"),
    },
  };
}

export default useAppTabBarViewModel;
