export interface CustomStyles {
  textColor?: string;
  backgroundColor?: string;
}

function getCustomStyles(customStyles?: CustomStyles) {
  return {
    styles: {},
    props: {
      textColor: customStyles?.textColor,
      buttonColor: customStyles?.backgroundColor,
    },
  };
}

export default getCustomStyles;
