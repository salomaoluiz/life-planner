export interface CustomStyles {
  backgroundColor?: string;
  textColor?: string;
}

function getCustomStyles(customStyles?: CustomStyles) {
  return {
    props: {
      buttonColor: customStyles?.backgroundColor,
      textColor: customStyles?.textColor,
    },
    styles: {},
  };
}

export default getCustomStyles;
