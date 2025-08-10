import React from "react";
import { render } from "@tests";

import Item from "../";

const defaultProps = {
  id: "test-item",
  onPress: jest.fn(),
  title: "Test Item Title",
};

// Mock the Text component
jest.mock("@components/Text", () => {
  const { View } = jest.requireActual("react-native");
  return {
    Title: ({ value, ...props }: { value: string }) => (
      <View testID="item-title" {...props} value={value} />
    ),
  };
});

// Mock List.Item from react-native-paper
jest.mock("react-native-paper", () => {
  const { View } = jest.requireActual("react-native");
  return {
    List: {
      Item: ({ id, disabled, onPress, title, ...props }: any) => (
        <View 
          testID="list-item" 
          id={id}
          disabled={disabled}
          onPress={onPress}
          title={title}
          {...props}
        />
      ),
    },
  };
});

function setup(props?: Partial<typeof defaultProps>) {
  render(<Item {...defaultProps} {...props} />);
}

export { defaultProps, setup };