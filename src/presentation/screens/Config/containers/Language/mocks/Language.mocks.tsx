import React from "react";
import { render } from "@tests";

import Language from "../";

// Mock translation hooks with proper availableLanguages
jest.mock("@presentation/i18n", () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn().mockImplementation((key) => key),
  }),
  useTranslationLocale: jest.fn().mockReturnValue({
    availableLanguages: ["en-US", "pt-BR"],
    changeLocale: jest.fn(),
    getLocale: jest.fn().mockReturnValue({
      languageTag: "en-US",
    }),
  }),
}));
// Mock translation hooks with proper availableLanguages
jest.mock("@presentation/i18n", () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: jest.fn().mockImplementation((key) => key),
  }),
  useTranslationLocale: jest.fn().mockReturnValue({
    availableLanguages: ["en-US", "pt-BR"],
    changeLocale: jest.fn(),
    getLocale: jest.fn().mockReturnValue({
      languageTag: "en-US",
    }),
  }),
}));

// Mock components
jest.mock("@components", () => ({
  Picker: ({ testID }: any) => <MockedComponent testID={testID ?? "picker"} />,
  Spacer: ({ testID }: any) => <MockedComponent testID={testID ?? "spacer"} />,
  Text: {
    Title: ({ testID }: any) => <MockedComponent testID={testID ?? "text-title"} />,
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

function setup() {
  render(<Language />);
}

export { setup };