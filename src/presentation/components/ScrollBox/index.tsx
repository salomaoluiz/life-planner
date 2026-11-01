import { ScrollView } from "react-native";

export interface ScrollBoxProps {
  accessibilityLabel: string;
  children: React.ReactNode;
  /** The box grows with its content up to this height, then scrolls on its own. */
  maxHeight: number;
  testID?: string;
}

// A list that scrolls inside its card, apart from the scroll of the screen: nested scroll is on for Android and the
// scroll bar is hidden (the list still scrolls by wheel, touch and keyboard).
function ScrollBox(props: ScrollBoxProps) {
  return (
    <ScrollView
      accessibilityLabel={props.accessibilityLabel}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={{ maxHeight: props.maxHeight }}
      testID={props.testID}
    >
      {props.children}
    </ScrollView>
  );
}

export default ScrollBox;
