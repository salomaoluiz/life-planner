import { getWindowsSizes } from "@utils/device";

function getSize(size: number | string, type: "height" | "width") {
  if (typeof size === "number") {
    return size;
  }

  const deviceSizes = getWindowsSizes();

  const percentage = size.replace("%", "");

  return (deviceSizes[type] * Number(percentage)) / 100;
}

export { getSize };
