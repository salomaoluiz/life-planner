import { act, hasText, render, screen } from "@tests";

import { Picker } from "@components";
import { useTranslationLocale } from "@presentation/i18n";

import Language from "./";

const changeLocale = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useTranslationLocale).mockReturnValue({
    availableLanguages: ["en-US", "pt-BR"],
    changeLocale,
    getLocale: () => ({ languageTag: "en-US" }),
  } as never);
});

it("SHOULD render the title and one option per available language", () => {
  render(<Language />);

  expect(hasText("configurations.configs.language.title")).toBe(true);
  expect(screen.UNSAFE_getByType(Picker).props.items).toEqual([
    { label: "en-US", value: "en-US" },
    { label: "pt-BR", value: "pt-BR" },
  ]);
});

it("SHOULD select the current locale", () => {
  render(<Language />);

  expect(screen.UNSAFE_getByType(Picker).props.selectedValue).toBe("en-US");
});

it("SHOULD change the locale and the selection WHEN another language is picked", () => {
  render(<Language />);

  act(() => {
    screen.UNSAFE_getByType(Picker).props.onValueChange("pt-BR");
  });

  expect(changeLocale).toHaveBeenCalledWith("pt-BR");
  expect(screen.UNSAFE_getByType(Picker).props.selectedValue).toBe("pt-BR");
});
