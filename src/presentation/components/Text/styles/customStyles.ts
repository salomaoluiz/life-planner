import { TextStyle } from "react-native";

export interface CustomStyles {
  textAlign?: "center" | "left" | "right";
  color?: string;
}

const getCustomStyles = (customStyles?: CustomStyles): TextStyle => {
  return {
    textAlign: customStyles?.textAlign,
    color: customStyles?.color,
  };
};

export default getCustomStyles;
