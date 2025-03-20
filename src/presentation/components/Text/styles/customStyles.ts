import { TextStyle } from "react-native";

export interface CustomStyles {
  color?: string;
  textAlign?: "center" | "left" | "right";
}

function getCustomStyles(customStyles?: CustomStyles): TextStyle {
  const styles = {
    color: customStyles?.color,
    textAlign: customStyles?.textAlign,
  };

  return Object.entries(styles).reduce<TextStyle>((acc, [key, value]) => {
    if (value) {
      acc = { ...acc, [key]: value };
    }
    return acc;
  }, {});
}

export default getCustomStyles;
