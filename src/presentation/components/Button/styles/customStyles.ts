export interface CustomStyles {
  backgroundColor?: string;
  textColor?: string;
}

interface Props {
  customStyles?: CustomStyles;
  disabled?: boolean;
}

function getBorderColor({ customStyles, disabled }: Props) {
  const style = {};

  if (disabled) {
    return style;
  }

  return {
    borderColor: customStyles?.textColor,
  };
}

function getCustomStyles({ customStyles, disabled }: Props) {
  return {
    props: {
      buttonColor: customStyles?.backgroundColor,
      textColor: customStyles?.textColor,
    },
    styles: {
      ...getBorderColor({ customStyles, disabled }),
    },
  };
}

export default getCustomStyles;
