import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

function getStyles() {
  const { theme } = useTheme();

  return {
    styles: StyleSheet.create({
      arrowIndicator: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 16,
        fontWeight: "bold",
      },
      backdrop: {
        backgroundColor: theme.colors.backdrop,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      },
      backdropContainer: {
        alignItems: "center",
        bottom: 0,
        justifyContent: "center",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      },
      blurView: {
        borderColor: theme.colors.glassBorder,
        borderRadius: 24,
        borderWidth: 1,
        overflow: "hidden",
        padding: theme.sizes.spacing.large,
        width: "100%",
      },
      button: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
      },
      buttonContainer: {
        backgroundColor: "transparent",
        marginTop: theme.sizes.spacing.large,
        padding: theme.sizes.spacing.small,
      },
      colorMenuContent: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        padding: 10,
      },
      colorOptionCircle: {
        alignItems: "center",
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        width: 32,
      },
      colorPreviewButton: {
        alignItems: "center",
        borderColor: theme.colors.glassBorder,
        borderRadius: 28,
        borderWidth: 1,
        height: 56,
        justifyContent: "center",
        overflow: "hidden",
        width: 56,
      },
      container: {
        borderRadius: 24,
        maxHeight: "85%",
        maxWidth: 540,
        width: "90%",
      },
      iconBoxMenu: {
        borderRadius: 8,
        margin: 4,
        padding: 2,
      },
      iconGridMenu: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      },
      iconMenuContent: {
        maxHeight: 200,
        padding: 8,
        width: 220,
      },
      iconPreviewButton: {
        alignItems: "center",
        backgroundColor: theme.colors.glassBackground,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        borderWidth: 1,
        height: 56,
        justifyContent: "center",
        width: 56,
      },
      loadingContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      },
      rowSelector: {
        alignItems: "center",
        flexDirection: "row",
        gap: 20,
        marginVertical: theme.sizes.spacing.medium,
      },
      selectorItem: {
        flexDirection: "column",
        gap: 8,
      },
      selectorLabel: {
        color: theme.colors.onSurface,
        fontSize: 14,
        fontWeight: "500",
      },
      selectorTriggerWrapper: {
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
      },
      titleContainer: {
        alignItems: "center",
        marginBottom: theme.sizes.spacing.medium,
      },
    }),
    theme,
  };
}

export default getStyles;
