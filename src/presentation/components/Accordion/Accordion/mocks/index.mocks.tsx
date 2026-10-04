import { Text, View } from "react-native";
import { List } from "react-native-paper";

import { fireEvent, render, screen } from "@tests";

import Accordion, { AccordionProps } from "@components/Accordion/Accordion";

// region mocks
const defaultProps: AccordionProps = {
  content: <Text testID="accordion-content">Content</Text>,
  getAccordionStatus: jest.fn(),
  header: <Text testID="accordion-header">Header</Text>,
  id: "accordion-1",
  left: <View testID="accordion-left" />,
  onLongPress: jest.fn(),
  onPress: jest.fn(),
  testID: "accordion",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<AccordionProps>) {
  render(<Accordion {...defaultProps} {...props} />);
}

function toggle() {
  fireEvent.press(screen.UNSAFE_getByType(List.Accordion));
}

const mocks = { defaultProps };

export { mocks, setup, toggle };
export { screen } from "@tests";
