import { translate } from "../";
import * as reactI18N from "../react-i18n";
import { TranslationKeys } from "../types";

// region Mocks

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");

// endregion Mocks

// region Spies
const reactI18NTranslateSpy = jest.spyOn(reactI18N, "reactI18NTranslate");
// endregion Spies

function setup(key: TranslationKeys, params?: Record<string, string>) {
  return translate(key, params);
}

const spies = {
  reactI18NTranslate: reactI18NTranslateSpy,
};

export { setup, spies };
export { screen } from "@tests";
