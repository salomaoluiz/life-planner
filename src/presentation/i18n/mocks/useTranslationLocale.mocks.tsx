import { renderHook } from "@tests";

import { useCases } from "@application/useCases";
import * as fetcher from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import { useTranslationLocale } from "../";
import { reactI18NHooks } from "../react-i18n";
import { availableLanguages } from "../translations";

// region Mocks

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");
jest.mock("@infrastructure/fetcher");

const useMutationFixture = new UseMutationFixture().reset();
const useMutationResponse = useMutationFixture.build();
const getLocaleResponse = {
  languageTag: "en",
};

const i18NUseTranslationLocaleResponse = {
  changeLocale: jest.fn(),
  getLocale: jest.fn().mockReturnValue(getLocaleResponse),
};
// endregion Mocks

// region Spies
const reactI18NUseTranslationLocaleSpy = jest
  .spyOn(reactI18NHooks, "useTranslationLocale")
  .mockReturnValue(i18NUseTranslationLocaleResponse);

const useMutationSpy = jest
  .spyOn(fetcher, "useMutation")
  .mockReturnValue(useMutationResponse);
// endregion Spies

function setup() {
  return renderHook(() => useTranslationLocale());
}

const spies = {
  reactI18NUseTranslationLocale: reactI18NUseTranslationLocaleSpy,
  useMutation: useMutationSpy,
};

const mocks = {
  availableLanguages,
  getLocaleResponse,
  i18NUseTranslationLocaleResponse,
  useCases,
  useMutationResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { act, screen } from "@tests";
