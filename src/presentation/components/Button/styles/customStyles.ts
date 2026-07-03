import { ThemeProp } from "../../../theme/types";

export enum ButtonMode {
  Filled = "contained",
  Outlined = "outlined",
  Text = "text",
}

export interface CustomStyles {
  backgroundColor?: string;
  textColor?: string;
}

interface Props {
  customStyles?: CustomStyles;
  disabled?: boolean;
  mode: ButtonMode;
  theme: ThemeProp;
}

function getBackgroundColor({ customStyles, mode, theme }: Props) {
  if (customStyles?.backgroundColor) {
    return {
      backgroundColor: customStyles.backgroundColor,
    };
  }
  if (mode === ButtonMode.Filled) {
    return {
      backgroundColor: theme.colors.glassButtonPrimaryBg,
    };
  }
  if (mode === ButtonMode.Outlined) {
    return {
      backgroundColor: theme.colors.glassButtonSecondaryBg,
    };
  }
  return {};
}

function getBorderColor({ customStyles, disabled, mode, theme }: Props) {
  if (disabled) {
    return {};
  }

  if (mode === ButtonMode.Outlined) {
    return {
      borderColor:
        customStyles?.textColor ?? theme.colors.glassButtonSecondaryBorder,
      borderWidth: 1,
    };
  }

  if (mode === ButtonMode.Filled) {
    return {
      borderColor: theme.colors.glassButtonPrimaryBorder,
      borderWidth: 1,
    };
  }

  return {};
}

function getCustomStyles(props: Props) {
  return {
    props: {
      textColor: getTextColor(props),
    },
    styles: {
      ...getBackgroundColor(props),
      ...getBorderColor(props),
    },
  };
}

function getTextColor(props: Props) {
  const { customStyles, mode, theme } = props;
  if (customStyles?.textColor) {
    return customStyles.textColor;
  }
  if (mode === ButtonMode.Text) {
    return theme.colors.primary;
  }
  if (mode === ButtonMode.Filled) {
    return theme.colors.onPrimary ?? "#ffffff";
  }
  return theme.colors.glassTextSecondary ?? "rgba(255, 255, 255, 0.8)";
}

export default getCustomStyles;
