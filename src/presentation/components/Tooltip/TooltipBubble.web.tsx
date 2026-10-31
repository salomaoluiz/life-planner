import { createPortal } from "react-dom";

import { useKitTheme } from "@components/utils/useKitTheme";

import { BUBBLE_WIDTH, TooltipBubbleProps } from "./TooltipBubble";

// Web: the bubble is drawn in the document body, outside the scrolling list, so no row below can paint over it
// (a list cell is positioned absolutely and clips or covers what overflows it).
function TooltipBubble(props: TooltipBubbleProps) {
  const { colors, radius, spacing } = useKitTheme();
  const anchor = props.anchor ?? { bottom: 0, right: BUBBLE_WIDTH };

  return createPortal(
    <div
      data-testid={props.testID}
      style={{
        background: colors.surfaceRaised,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        boxShadow: `0 12px 32px ${colors.scrim}`,
        boxSizing: "border-box",
        left: Math.max(spacing.xs, anchor.right - BUBBLE_WIDTH),
        padding: spacing.sm,
        pointerEvents: "none",
        position: "fixed",
        top: anchor.bottom + spacing.xxs,
        width: BUBBLE_WIDTH,
        zIndex: 1000,
      }}
    >
      {props.children}
    </div>,
    document.body,
  );
}

export default TooltipBubble;
