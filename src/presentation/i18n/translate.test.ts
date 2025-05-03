import { setup, spies } from "./mocks/translate.mocks";
import { TranslationKeys } from "./types";

it("SHOULD translate the key", () => {
  const key: TranslationKeys = "configurations.configs.language.title";
  const params = { key: "value" };

  setup(key, params);

  expect(spies.reactI18NTranslate).toHaveBeenCalledWith(key, params);
});
