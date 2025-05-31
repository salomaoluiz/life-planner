import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";
import { ThemeProp } from "@presentation/theme/types";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

interface Props {
  level: number;
  owner: CategoryViewModel["ownerType"];
}

function getChildrenStyles(level: number, theme: ThemeProp) {
  if (level === 0)
    return {
      boxShadow: theme.colors.elevation.large,
      marginTop: theme.sizes.spacing.medium,
    };

  const horizontalMargin: Record<number, number> = {
    1: theme.sizes.spacing.large,
    2: theme.sizes.spacing.xlarge,
    3: theme.sizes.spacing.xxlarge,
  };

  return {
    boxShadow: theme.colors.elevation.small,
    marginHorizontal: horizontalMargin[level] ?? theme.sizes.spacing.xxlarge,
  };
}

function getStyles(props: Props) {
  const { theme } = useTheme();

  const ownerColor =
    props.owner === "USER" ? theme.colors.primary : theme.colors.secondary;

  const ownerBackgroundColor =
    props.owner === "USER"
      ? theme.colors.primaryContainer
      : theme.colors.secondaryContainer;

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.sizes.borderRadius.medium,
        justifyContent: "space-between",
        marginVertical: theme.sizes.spacing.xxsmall,
        padding: theme.sizes.spacing.small,
        ...getChildrenStyles(props.level, theme),
      },
      icon: {
        color: ownerColor,
      },
      iconContainer: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.sizes.borderRadius.xlarge,
        height: theme.sizes.spacing.xlarge,
        justifyContent: "center",
        marginRight: theme.sizes.spacing.small,
        padding: theme.sizes.spacing.xsmall,
        width: theme.sizes.spacing.xlarge,
      },
      menuContainer: {
        alignItems: "center",
        flexDirection: "row",
        flexGrow: 1,
        justifyContent: "center",
        marginHorizontal: theme.sizes.spacing.xxsmall,
      },
      menuItemContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.sizes.borderRadius.medium,
        boxShadow: theme.colors.elevation.large,
      },
      ownerBackdrop: {
        backgroundColor: ownerBackgroundColor,
        borderRadius: theme.sizes.borderRadius.large,
        height: "100%",
        opacity: 0.5,
        position: "absolute",
        width: "100%",
      },
      ownerContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: theme.sizes.spacing.small,
        paddingVertical: theme.sizes.spacing.xxsmall,
      },
      ownerIconContainer: {
        marginRight: theme.sizes.spacing.xxsmall,
      },
      row: {
        alignItems: "center",
        flexDirection: "row",
        flexShrink: 1,
      },
    }),
    theme,
  };
}

export default getStyles;
