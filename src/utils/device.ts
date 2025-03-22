import { Dimensions } from "react-native";

function getScreenSizes() {
  const { height, width } = Dimensions.get("screen");

  return {
    height,
    width,
  };
}

function getWindowsSizes() {
  const { height, width } = Dimensions.get("window");

  return {
    height,
    width,
  };
}

export { getScreenSizes, getWindowsSizes };
