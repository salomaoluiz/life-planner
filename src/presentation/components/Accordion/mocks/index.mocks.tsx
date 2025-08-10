import React from "react";
import { Text, View } from "react-native";

import { render } from "@tests";

import { Accordion, AccordionProps } from "@components";

// Mock components for testing
const MockHeader = () => <Text>Test Header</Text>;
const MockContent = () => <Text>Test Content</Text>;
const MockLeft = () => <Text>Left Content</Text>;
const MockRight = () => <Text>Right Content</Text>;

const MockItemLeft = () => <Text>Left Item</Text>;
const MockItemRight = () => <Text>Right Item</Text>;

interface ContainerSetupProps extends Partial<AccordionProps> {
  hasLeft?: boolean;
  hasRight?: boolean;
}

interface ItemSetupProps {
  id?: string;
  onPress?: () => void;
  hasLeft?: boolean;
  hasRight?: boolean;
}

const defaultContainerProps: AccordionProps = {
  content: <MockContent />,
  getAccordionStatus: jest.fn(),
  header: <MockHeader />,
  id: "test-accordion",
  onPress: jest.fn(),
  testID: "accordion-container",
};

const defaultItemProps = {
  id: "test-item",
  onPress: jest.fn(),
  title: "Test Item",
  testID: "accordion-item",
};

function setupContainer(props?: ContainerSetupProps) {
  const finalProps = { ...defaultContainerProps, ...props };
  
  if (props?.hasLeft) {
    finalProps.left = <MockLeft />;
  }
  
  if (props?.hasRight) {
    finalProps.right = <MockRight />;
  }

  // Add testID to List.Accordion through a mock component wrapper
  const TestAccordion = () => (
    <View testID={finalProps.testID}>
      <Accordion.Container {...finalProps} />
    </View>
  );

  render(<TestAccordion />);
}

function setupItem(props?: ItemSetupProps) {
  const finalProps = { ...defaultItemProps, ...props };
  
  const itemProps: any = {
    id: finalProps.id,
    onPress: finalProps.onPress,
    title: finalProps.title,
  };
  
  if (props?.hasLeft) {
    itemProps.left = <MockItemLeft />;
  }
  
  if (props?.hasRight) {
    itemProps.right = <MockItemRight />;
  }

  // Add testID to List.Item through a mock component wrapper
  const TestItem = () => (
    <View testID="accordion-item">
      <Accordion.Item {...itemProps} />
    </View>
  );

  render(<TestItem />);
}

const setup = {
  container: setupContainer,
  item: setupItem,
};

export { setup };