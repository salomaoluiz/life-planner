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
  const screenWidth = Dimensions.get("screen").width;

  const isTablet = screenWidth >= 600;
  const isDesktop = screenWidth >= 1024;

  const scaleFactor = isDesktop ? 1.6 : isTablet ? 1.3 : 1;
  const spacingFactor = isDesktop ? 1.8 : isTablet ? 1.4 : 1;
  const borderFactor = isDesktop ? 1.5 : isTablet ? 1.2 : 1;

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
