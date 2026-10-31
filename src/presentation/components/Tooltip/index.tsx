import { ReactNode, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { isWeb } from "@utils/platform";

import TooltipBubble, { TooltipAnchor } from "./TooltipBubble";

export interface TooltipProps {
  children: ReactNode;
  /** What the bubble shows; no content = no tooltip */
  content?: ReactNode;
  testID?: string;
}

// Web only: the bubble shows under the children while the pointer is over them or a child has the keyboard focus. Native renders the children as they are.
function Tooltip(props: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<TooltipAnchor>();
  const ref = useRef<View>(null);

  function show() {
    // On the web the host node is a DOM element: where it is on the page places the bubble.
    const node = ref.current as unknown as null | {
      getBoundingClientRect?: () => TooltipAnchor;
    };
    const rect = node?.getBoundingClientRect?.();

    setAnchor(rect && { bottom: rect.bottom, right: rect.right });
    setVisible(true);
  }

  if (!isWeb() || !props.content) {
    return <>{props.children}</>;
  }

  return (
    <Pressable
      accessible={false}
      focusable={false}
      onBlur={() => setVisible(false)}
      onFocus={show}
      onHoverIn={show}
      onHoverOut={() => setVisible(false)}
      ref={ref}
      style={styles.anchor}
    >
      {props.children}
      {visible && (
        <TooltipBubble anchor={anchor} testID={props.testID}>
          {props.content}
        </TooltipBubble>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({ anchor: { zIndex: 10 } });

export default Tooltip;
