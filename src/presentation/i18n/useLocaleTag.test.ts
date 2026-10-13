import { renderHook } from "@tests";

import { reactI18NHooks } from "./react-i18n";
import useLocaleTag from "./useLocaleTag";

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");

it("SHOULD return the active language tag", () => {
  jest.spyOn(reactI18NHooks, "useTranslationLocale").mockReturnValue({
    changeLocale: jest.fn(),
    getLocale: jest.fn().mockReturnValue({ languageTag: "pt-BR" }),
  } as never);

  const { result } = renderHook(() => useLocaleTag());

  expect(result.current).toBe("pt-BR");
});
