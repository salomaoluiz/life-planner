import { TextStyle } from "react-native";

export interface CustomStyles {
  color?: string;
  textAlign?: "center" | "left" | "right";
}

function getCustomStyles(customStyles?: CustomStyles): TextStyle {
  return {
    color: customStyles?.color,
    textAlign: customStyles?.textAlign,
  };
}

export default getCustomStyles;
