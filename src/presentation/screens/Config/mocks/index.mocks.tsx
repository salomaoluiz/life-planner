import React from "react";
import { render } from "@tests";

import * as i18n from "@presentation/i18n";

import Config from "../";

// Mock the containers
jest.mock("../containers", () => {
  const { View } = jest.requireActual("react-native");
  return {
    DarkMode: () => <View testID="dark-mode-container" />,
    Language: () => <View testID="language-container" />,
    Logout: () => <View testID="logout-container" />,
  };
});

// Mock components  
jest.mock("@components", () => {
  const { View } = jest.requireActual("react-native");
  return {
    Spacer: ({ direction, size, ...props }: any) => (
      <View testID="spacer" direction={direction} size={size} {...props} />
    ),
    Text: {
      Headline: ({ value, ...props }: { value: string }) => (
        <View testID="config-title" value={value} {...props} />
      ),
    },
  };
});

// Mock the translation hook
const useTranslationMock = {
  t: jest.fn().mockReturnValue("Configurations"),
};

const useTranslationSpy = jest.spyOn(i18n, "useTranslation").mockReturnValue(useTranslationMock);

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<Config />);
}

const mocks = {
  useTranslation: useTranslationMock,
};

const spies = {
  useTranslation: useTranslationSpy,
};

export { mocks, setup, spies };