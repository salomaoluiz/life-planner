import i18next from "i18next";
import * as reactI18Next from "react-i18next";

import { renderHook } from "@tests";

import useTranslationLocale from "../useTranslationLocale";

// region Mocks
jest.mock("expo-localization");
jest.mock("react-i18next");
jest.mock("i18next");

const useTranslationI18NextResponse = {
  i18n: {
    language: "en-US",
  },
} as ReturnType<typeof reactI18Next.useTranslation>;

// endregion Mocks

// region Spies
const useTranslationI18NextSpy = jest
  .spyOn(reactI18Next, "useTranslation")
  .mockReturnValue(useTranslationI18NextResponse);

const changeLanguageSpy = jest.spyOn(i18next, "changeLanguage");

// endregion Spies

function setup() {
  return renderHook(() => useTranslationLocale());
}

const spies = {
  changeLanguage: changeLanguageSpy,
  useTranslationI18Next: useTranslationI18NextSpy,
};

const mocks = {
  useTranslationI18NextResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
