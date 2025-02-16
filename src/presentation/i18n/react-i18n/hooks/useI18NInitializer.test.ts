import { renderHook } from "@tests";
import useI18NInitializer from "./useI18NInitializer";
import * as loaderProvider from "@providers/loader";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { enUS, ptBR } from "@presentation/i18n/translations";
import { waitFor } from "@testing-library/react-native";

jest.mock("i18next");

const loaderProviderResponse = {
  setIsLoading: jest.fn(),
};

const initSpy = jest.fn().mockResolvedValue({});
const useSpy = jest.spyOn(i18next, "use").mockReturnValue({
  init: initSpy,
} as never);

jest
  .spyOn(loaderProvider, "useProviderLoader")
  .mockReturnValue(loaderProviderResponse as never);

const setup = () => renderHook(() => useI18NInitializer());

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD use the react-i18next", () => {
  setup();

  expect(useSpy).toHaveBeenCalledTimes(1);
  expect(useSpy).toHaveBeenCalledWith(initReactI18next);
});

it("SHOULD init with correct params", () => {
  setup();

  expect(initSpy).toHaveBeenCalledTimes(1);
  expect(initSpy).toHaveBeenCalledWith({
    resources: {
      "en-US": enUS,
      "pt-BR": ptBR,
    },
    lng: i18next.language,
    fallbackLng: "en-US",
  });
});

it("SHOULD set i18n loading as false in provider loader hook", async () => {
  setup();

  await waitFor(() => {
    expect(loaderProviderResponse.setIsLoading).toHaveBeenCalledTimes(1);
    expect(loaderProviderResponse.setIsLoading).toHaveBeenCalledWith(
      false,
      "i18n",
    );
  });
});
