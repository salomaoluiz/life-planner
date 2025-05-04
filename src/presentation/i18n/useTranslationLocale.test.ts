import { mocks, setup, spies } from "./mocks/useTranslationLocale.mocks";

it("SHOULD render the hooks correctly", () => {
  setup();

  expect(spies.reactI18NUseTranslationLocale).toHaveBeenCalledTimes(1);
  expect(spies.useMutation).toHaveBeenCalledTimes(1);
  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: [mocks.useCases.saveUserConfigsUseCase.uniqueName],
    fetch: mocks.useCases.saveUserConfigsUseCase.execute,
  });
});

it("SHOULD change the language correctly", async () => {
  const {
    result: { current },
  } = setup();

  await current.changeLocale("en");

  expect(mocks.useMutationResponse.mutate).toHaveBeenCalledTimes(1);
  expect(mocks.useMutationResponse.mutate).toHaveBeenCalledWith({
    language: "en",
  });
  expect(
    mocks.i18NUseTranslationLocaleResponse.changeLocale,
  ).toHaveBeenCalledTimes(1);
  expect(
    mocks.i18NUseTranslationLocaleResponse.changeLocale,
  ).toHaveBeenCalledWith("en");
});

it("SHOULD get the locale correctly", () => {
  const {
    result: { current },
  } = setup();

  const locale = current.getLocale();

  expect(
    mocks.i18NUseTranslationLocaleResponse.getLocale,
  ).toHaveBeenCalledTimes(1);
  expect(locale).toEqual({
    languageTag: mocks.getLocaleResponse.languageTag,
  });
});

it("SHOULD return the available languages correctly", () => {
  const {
    result: { current },
  } = setup();

  expect(current.availableLanguages).toEqual(mocks.availableLanguages);
});
