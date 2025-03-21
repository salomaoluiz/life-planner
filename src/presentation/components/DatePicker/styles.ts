import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

interface Props {
  hasDate: boolean;
}
function getStyles(props: Props) {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      clearIconContainer: {
        alignItems: "flex-end",
        flex: 1,
        justifyContent: "center",
      },
      container: {
        alignItems: "center",
        borderColor: theme.colors.onBackground,
        borderRadius: theme.sizes.borderRadius.small,
        borderWidth: 1,
        flexDirection: "row",
        height: theme.sizes.noScaled.spacing.xxlarge,
        justifyContent: "space-between",
        paddingLeft: theme.sizes.spacing.xsmall,
        width: "100%",
      },
      dateContainer: {
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        top: -theme.sizes.noScaled.spacing.xsmall,
        zIndex: 0,
      },
      labelContainer: {
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        left: props.hasDate ? -theme.sizes.spacing.xxsmall : 0,
        paddingHorizontal: props.hasDate ? theme.sizes.spacing.xxsmall : 0,
        top: props.hasDate ? -theme.sizes.noScaled.spacing.small : 0,
        zIndex: 1,
      },
      pressable: {
        backgroundColor: theme.colors.background,
        flex: 1,
        flexDirection: "row",
      },
    }),
    theme,
  };
}

export default getStyles;
