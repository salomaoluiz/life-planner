import { TranslationKeys } from "@presentation/i18n/types";

import { screen, setup, spies } from "./mocks/index.mocks";

it("SHOULD use the react-i18n hooks in useTranslation", () => {
  setup.useTranslation();

  expect(spies.reactI18NUseTranslation).toHaveBeenCalled();
});

it("SHOULD use the react-i18n hooks in useTranslationLocale", () => {
  setup.useTranslationLocale();

  expect(spies.reactI18NUseTranslationLocale).toHaveBeenCalled();
});

it("SHOULD render the react-i18n provider", () => {
  setup.provider();

  expect(screen.getByTestId("react-i18n-provider")).toBeOnTheScreen();
  expect(screen.getByTestId("i18n-provider-children")).toBeOnTheScreen();
  expect(screen.toJSON()).toMatchSnapshot();
});

it("SHOULD translate the key", () => {
  const key: TranslationKeys = "configurations.configs.language.title";
  const params = { key: "value" };

  setup.translate(key, params);

  expect(spies.reactI18NTranslate).toHaveBeenCalledWith(key, params);
});
