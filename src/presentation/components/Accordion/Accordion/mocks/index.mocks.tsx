import React from "react";
import { View } from "react-native";
import { render } from "@tests";

import Accordion, { AccordionProps } from "../";

// Mock List.Accordion from react-native-paper
jest.mock("react-native-paper", () => {
  const View = jest.requireActual("react-native").View;
  return {
    ...jest.requireActual("react-native-paper"),
    List: {
      Accordion: ({ 
        expanded, 
        id, 
        left, 
        onLongPress, 
        onPress, 
        right, 
        style, 
        testID, 
        title,
        children,
        ...props 
      }: any) => (
        <View
          testID={testID}
          id={id}
          expanded={expanded}
          onPress={onPress}
          onLongPress={onLongPress}
          style={style}
          left={left}
          right={right}
          title={title}
          {...props}
        >
          {children}
        </View>
      ),
    },
  };
});

const defaultProps: AccordionProps = {
  content: <View testID="accordion-content" />,
  getAccordionStatus: jest.fn(),
  header: <View testID="accordion-header" />,
  id: "test-accordion",
  onLongPress: jest.fn(),
  onPress: jest.fn(),
  testID: "test-accordion",
};

function setup(props?: Partial<AccordionProps>) {
  render(<Accordion {...defaultProps} {...props} />);
}

export { defaultProps, setup };