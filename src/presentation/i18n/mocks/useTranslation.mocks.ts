import { renderHook } from "@tests";

import { useTranslation } from "../";
import { reactI18NHooks } from "../react-i18n";

// region Mocks

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");

// endregion Mocks

// region Spies
const reactI18NUseTranslationSpy = jest.spyOn(reactI18NHooks, "useTranslation");
// endregion Spies

function setupUseTranslation() {
  return renderHook(() => useTranslation());
}

const setup = {
  useTranslation: setupUseTranslation,
};

const spies = {
  reactI18NUseTranslation: reactI18NUseTranslationSpy,
};

export { setup, spies };
export { screen } from "@tests";
