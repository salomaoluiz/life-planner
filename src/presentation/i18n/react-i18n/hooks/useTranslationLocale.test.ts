import { mocks, setup, spies } from "./mocks/useTranslationLocale.mocks";

it("SHOULD change the language from i18next", async () => {
  const tag = "pt-BR";

  const { result } = setup();
  await result.current.changeLocale(tag);

  expect(spies.changeLanguage).toHaveBeenCalledWith(tag);
});

it("SHOULD return the current locale", () => {
  const { result } = setup();
  const locale = result.current.getLocale();

  expect(locale).toEqual({
    languageTag: mocks.useTranslationI18NextResponse.i18n.language,
  });
});
