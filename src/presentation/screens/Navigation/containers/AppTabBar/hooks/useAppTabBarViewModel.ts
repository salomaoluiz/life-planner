import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { router, usePathname } from "expo-router";

import { NavigationRailItem } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useBreakpoint } from "@presentation/theme";
import {
  getFinancialSection,
  getFinancialSectionPath,
} from "@screens/Financial/Layout/models/financialSections";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { screenPath } from "@screens/Navigation/models/modalPath";
import {
  NAVIGATION_ITEMS,
  SETTINGS_PATH,
} from "@screens/Navigation/models/navigationItems";

const FINANCES_ROUTE = "financial";
const FINANCES_PATH = "/financial/transaction";

function useAppTabBarViewModel({ navigation, state }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { openModal } = useModalNavigation();
  const breakpoint = useBreakpoint();

  const pathname = usePathname();
  const isWide = breakpoint === "expanded";

  const activeRouteName = state.routes[state.index].name;
  const activeChildPath =
    activeRouteName === FINANCES_ROUTE
      ? getFinancialSectionPath(getFinancialSection(screenPath(pathname)))
      : undefined;

  const items: NavigationRailItem[] = NAVIGATION_ITEMS.map((item) => ({
    children: item.children?.map((child) => ({
      label: t(child.labelKey),
      path: child.path,
      testID: child.testID,
    })),
    icon: item.icon,
    label: t(item.labelKey),
    routeName: item.routeName,
    testID: item.testID,
  }));

  function onTabPress(routeName: string) {
    if (routeName === FINANCES_ROUTE) {
      // Finances always opens Transactions; a re-press on the bottom bar opens the section picker.
      if (!isWide && activeRouteName === FINANCES_ROUTE) {
        openModal("section_picker");
      } else {
        router.navigate(FINANCES_PATH as never);
      }

      return;
    }

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

  function onChildPress(path: string) {
    // replace: switching sections must not grow the back stack
    router.replace(path as never);
  }

  function onAddPress() {
    openModal("quick_add");
  }

  function onProfilePress() {
    router.push(SETTINGS_PATH as never);
  }

  return {
    activeChildPath,
    activeRouteName,
    isWide,
    items,
    onAddPress,
    onChildPress,
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
