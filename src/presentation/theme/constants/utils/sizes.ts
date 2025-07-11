import { Dimensions } from "react-native";

function getScaleFunctions() {
  const { borderFactor, scaleFactor, spacingFactor } = getScaleRatio();

  function scaleFontSize(size: number) {
    return Math.round(size * scaleFactor);
  }
  function scaleSpacing(size: number) {
    return Math.round(size * spacingFactor);
  }
  function scaleBorder(size: number) {
    return Math.round(size * borderFactor);
  }

  return { scaleBorder, scaleFontSize, scaleSpacing };
}

function getScaleRatio() {
  const screenWidth = Dimensions.get("window").width;

  const isTablet = screenWidth >= 600;
  const isDesktop = screenWidth >= 1024;

  let scaleFactor = 1;
  let spacingFactor = 1;
  let borderFactor = 1;

  if (isTablet) {
    scaleFactor = 1.15;
    spacingFactor = 1.15;
    borderFactor = 1.15;
  }

  if (isDesktop) {
    scaleFactor = 1.3;
    spacingFactor = 1.3;
    borderFactor = 1.3;
  }

  return { borderFactor, scaleFactor, spacingFactor };
}

function rescaleSizes<R>(object: R, scaleFunction: (size: number) => number) {
  const scaledObject: Record<string, unknown> = {};

  for (const key in object) {
    if (typeof object[key] === "number") {
      scaledObject[key] = scaleFunction(object[key]);
    } else {
      scaledObject[key] = object[key];
    }
  }

  return scaledObject as R;
}

export { getScaleFunctions, getScaleRatio, rescaleSizes };
