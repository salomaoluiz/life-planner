import { setup, spies } from "./mocks/useTranslation.mocks";

it("SHOULD use the react-i18n hooks in useTranslation", () => {
  setup.useTranslation();

  expect(spies.reactI18NUseTranslation).toHaveBeenCalled();
});
