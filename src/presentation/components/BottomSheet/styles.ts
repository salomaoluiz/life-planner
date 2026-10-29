import { StyleSheet, ViewStyle } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";
import { isWeb } from "@utils/platform";

const FOOTER_BUTTON_MIN_WIDTH = 200;
const GRABBER = { height: 4, width: 40 };

function useStyles(
  wide: boolean,
  form: boolean,
  medium: boolean,
  wizard = false,
  fluid?: { height: number; width: number },
  paneHeight?: number,
) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const wideForm = wide && form;
  let maxWidth = sizes.formMaxWidth;
  if (wideForm) {
    maxWidth = medium
      ? sizes.formDialogMaxWidthMedium
      : sizes.formDialogMaxWidth;
  }
  // Spec 047 FR 30: the import wizard is a wider form (about 1040 px on expanded).
  if (wideForm && wizard && !medium) {
    maxWidth = sizes.wizardDialogMaxWidth;
  }

  const fluidSheet = {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: fluid?.height,
    paddingTop: spacing.xs,
    width: fluid?.width,
  } as const;
  const wideSheet = {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: paneHeight,
    maxHeight: "90%",
    maxWidth,
    // Outer breathing room: the close button never touches the dialog border.
    paddingTop: spacing.xs,
    width: "100%",
  } as const;
  const compactSheet = {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: "90%",
  } as const;
  let sheetStyle: ViewStyle = compactSheet;

  if (fluid) {
    sheetStyle = fluidSheet;
  } else if (wide) {
    sheetStyle = wideSheet;
  }

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.scrim,
    },
    body: wideForm
      ? {
          gap: spacing.md,
          paddingHorizontal: spacing.xxl,
          paddingVertical: spacing.xl,
        }
      : { gap: spacing.md, padding: spacing.lg },
    // Spec 048: a fluid sheet is as tall as the window allows; the header and the footer never scroll.
    fluidBody: { flex: 1, minHeight: 0 },
    footer: wideForm
      ? {
          alignItems: "center",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          flexDirection: "row",
          paddingHorizontal: spacing.xxl,
          paddingVertical: spacing.lg,
        }
      : { gap: spacing.xs, padding: spacing.lg },
    footerAction: { minWidth: FOOTER_BUTTON_MIN_WIDTH },
    // A fullWidth primary button is not stretched on a wide form.
    footerEnd: { flexDirection: "row", gap: spacing.md },
    grabber: {
      alignSelf: "center",
      backgroundColor: colors.border,
      borderRadius: radius.full,
      height: GRABBER.height,
      marginVertical: spacing.xs,
      width: GRABBER.width,
    },
    grabberArea: { paddingVertical: spacing.xs },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    headerForm: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingLeft: spacing.xxl,
      paddingRight: spacing.lg,
      paddingTop: spacing.lg,
    },
    // Wide: the dialog keeps `spacing.xl` of air on both sides of a narrow window.
    overlay: wide
      ? { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl }
      : { flex: 1, justifyContent: "flex-end" },
    // react-native-web passes scrollbarColor through; RN's ViewStyle does not declare it.
    scroll: isWeb()
      ? ({ scrollbarColor: `${colors.border} transparent` } as ViewStyle)
      : {},
    sheet: sheetStyle,
    title: { flex: 1 },
  });
}

export default useStyles;
