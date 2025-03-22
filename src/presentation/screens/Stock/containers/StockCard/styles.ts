import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

interface Props {
  isExpired: boolean;
}
function getStyles(props: Props) {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: theme.colors.surfaceVariant,
        borderColor: theme.colors.surfaceVariant,
        borderRadius: theme.sizes.borderRadius.small,
        borderWidth: 1,
        boxShadow: props.isExpired
          ? `inset 0px 0px 20px ${theme.colors.error}`
          : undefined,
        elevation: 10,
        flex: 1,
        margin: theme.sizes.spacing.small,
      },
      iconContainer: {
        position: "absolute",
        right: 0,
      },
      row: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      subContainer: {
        padding: theme.sizes.spacing.small,
      },
    }),
    theme,
  };
}

export default getStyles;
