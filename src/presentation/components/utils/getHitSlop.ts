import { Insets } from "react-native";

export function getHitSlop(
  size: { height: number; width?: number },
  min: number,
): Insets | undefined {
  const vertical = Math.max(0, Math.ceil((min - size.height) / 2));
  const horizontal =
    size.width === undefined
      ? 0
      : Math.max(0, Math.ceil((min - size.width) / 2));

  if (!vertical && !horizontal) {
    return undefined;
  }

  return {
    bottom: vertical,
    ...(horizontal ? { left: horizontal, right: horizontal } : {}),
    top: vertical,
  };
}
