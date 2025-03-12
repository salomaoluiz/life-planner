import * as expoLocalization from "expo-localization";
import i18next from "i18next";
import * as reactI18Next from "react-i18next";

import { renderHook } from "@tests";

import useTranslationLocale from "./useTranslationLocale";

jest.mock("expo-localization");
jest.mock("react-i18next");
jest.mock("i18next");

const useTranslationSpy = jest
  .spyOn(reactI18Next, "useTranslation")
  .mockReturnValue({
    i18n: {
      language: "en-US",
    },
  } as never);

const locales = [{ languageTag: "en-US" }, { languageTag: "pt" }];
const changeLanguageSpy = jest.spyOn(i18next, "changeLanguage");
jest.spyOn(expoLocalization, "getLocales").mockReturnValue(locales as never);

function setup() {
  return renderHook(() => useTranslationLocale());
}

it("SHOULD change the language from i18next", async () => {
  const tag = "pt-BR";

  const { result } = setup();
  result.current.changeLocale(tag);

  expect(changeLanguageSpy).toHaveBeenCalledWith(tag);
});

it("SHOULD return the current locale when languageTag is equal to i18n language", () => {
  const { result } = setup();
  const locale = result.current.getLocale();

  expect(locale).toEqual(locales[0]);
});

it("SHOULD return the first locale when languageTag is different from i18n language", () => {
  useTranslationSpy.mockReturnValueOnce({
    i18n: { language: "de" },
  } as never);

  const { result } = setup();
  const locale = result.current.getLocale();

  expect(locale).toEqual(locales[0]);
});

it("SHOULD return the locale if the i18n language has a part of the tag", () => {
  useTranslationSpy.mockReturnValueOnce({
    i18n: { language: "pt-BR" },
  } as never);

  const { result } = setup();
  const locale = result.current.getLocale();

  expect(locale).toEqual(locales[1]);
});

it("SHOULD return the available languages", () => {
  const { result } = setup();
  const availableLanguages = result.current.availableLanguages;

  expect(availableLanguages).toEqual(["en-US", "pt-BR"]);
});
