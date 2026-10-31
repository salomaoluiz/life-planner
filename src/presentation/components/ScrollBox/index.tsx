import { ScrollView } from "react-native";

export interface ScrollBoxProps {
  accessibilityLabel: string;
  children: React.ReactNode;
  /** The box grows with its content up to this height, then scrolls on its own. */
  maxHeight: number;
  testID?: string;
}

// A list that scrolls inside its card, apart from the scroll of the screen: nested scroll is on for Android.
function ScrollBox(props: ScrollBoxProps) {
  return (
    <ScrollView
      accessibilityLabel={props.accessibilityLabel}
      nestedScrollEnabled
      showsVerticalScrollIndicator
      style={{ maxHeight: props.maxHeight }}
      testID={props.testID}
    >
      {props.children}
    </ScrollView>
  );
}

export default ScrollBox;
