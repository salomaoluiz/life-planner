import * as reactI18N from "@presentation/i18n/react-i18n";
import { View } from "react-native";
import { reactI18NHooks } from "@presentation/i18n/react-i18n";
import { render, renderHook } from "@tests";
import {
  useTranslation,
  useTranslationLocale,
  I18NProvider,
  translate,
} from "@presentation/i18n";

jest.mock("@presentation/i18n/react-i18n");

const reactI18NUseTranslationSpy = jest.spyOn(reactI18NHooks, "useTranslation");
const reactI18NUseTranslationLocaleSpy = jest.spyOn(
  reactI18NHooks,
  "useTranslationLocale",
);
const reactI18NTranslateSpy = jest.spyOn(reactI18N, "reactI18NTranslate");

jest
  .spyOn(reactI18N, "ReactI18NPProvider")
  .mockImplementation(({ children }) => (
    <View testID="react-i18n-provider">{children}</View>
  ));

function setupUseTranslationLocale() {
  return renderHook(() => useTranslationLocale());
}

function setupUseTranslation() {
  return renderHook(() => useTranslation());
}

function setupProvider() {
  render(I18NProvider({ children: <View testID="i18n-provider-children" /> }));
}

function setupTranslate(key: string, params?: Record<string, string>) {
  return translate(key, params);
}

const setup = {
  useTranslationLocale: setupUseTranslationLocale,
  useTranslation: setupUseTranslation,
  provider: setupProvider,
  translate: setupTranslate,
};

const spies = {
  reactI18NUseTranslation: reactI18NUseTranslationSpy,
  reactI18NUseTranslationLocale: reactI18NUseTranslationLocaleSpy,
  reactI18NTranslate: reactI18NTranslateSpy,
};

export { setup, spies };
export { screen } from "@tests";
