import { reactI18NHooks } from "@presentation/i18n/react-i18n";
import * as reactI18N from "@presentation/i18n/react-i18n";
import { renderHook, screen } from "@testing-library/react-native";
import { render } from "@tests";
import { useTranslation, useTranslationLocale, I18NProvider } from "./";
import { View } from "react-native";

jest.mock("@presentation/i18n/react-i18n");
const reactI18NUseTranslation = jest.spyOn(reactI18NHooks, "useTranslation");
const reactI18NUseTranslationLocale = jest.spyOn(
  reactI18NHooks,
  "useTranslationLocale",
);
jest
  .spyOn(reactI18N, "ReactI18NPProvider")
  .mockImplementation(({ children }) => (
    <View testID="react-i18n-provider">{children}</View>
  ));

it("SHOULD use the react-i18n hooks in useTranslation", () => {
  renderHook(() => useTranslation());

  expect(reactI18NUseTranslation).toHaveBeenCalled();
});

it("SHOULD use the react-i18n hooks in useTranslationLocale", () => {
  renderHook(() => useTranslationLocale());

  expect(reactI18NUseTranslationLocale).toHaveBeenCalled();
});

it("SHOULD render the react-i18n provider", () => {
  render(I18NProvider({ children: <View testID="i18n-provider-children" /> }));

  expect(screen.getByTestId("react-i18n-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("i18n-provider-children")).toBeOnTheScreen();
  expect(screen.toJSON()).toMatchSnapshot();
});
