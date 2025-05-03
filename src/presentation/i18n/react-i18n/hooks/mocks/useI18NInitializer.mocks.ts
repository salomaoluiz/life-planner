import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { renderHook } from "@tests";

import ConfigsDTO from "@application/dto/configs/ConfigsDTO";
import * as fetcher from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { translations } from "@presentation/i18n/translations";
import * as loaderProvider from "@providers/loader";

import useI18NInitializer from "../useI18NInitializer";

// region Mocks
jest.mock("i18next", () => {
  const originalModule = jest.requireActual("i18next");
  return {
    ...originalModule,
    language: "en-US",
    use: jest.fn().mockReturnValue({
      init: jest.fn(),
    }),
  };
});
jest.mock("@infrastructure/fetcher");

const loaderProviderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};
const useQueryFixture = new UseQueryFixture<Partial<ConfigsDTO>>().reset();
const useQueryPendingResponse = useQueryFixture.build();
const useQuerySuccessFixture = useQueryFixture.withStatus("success");

const useQuerySuccessWithDataResponse = useQuerySuccessFixture
  .withData({
    language: "en-US",
  })
  .build();
const useQuerySuccessResponse = useQuerySuccessFixture.build();

// endregion Mocks

// region Spies
const initSpy = jest.fn().mockResolvedValue({});
const useSpy = jest.spyOn(i18next, "use").mockReturnValue({
  init: initSpy,
} as never);

jest
  .spyOn(loaderProvider, "useProviderLoader")
  .mockReturnValue(loaderProviderResponse);
const useQuerySpy = jest
  .spyOn(fetcher, "useQuery")
  .mockReturnValue(useQueryPendingResponse);
// region Spies

function setup() {
  return renderHook(() => useI18NInitializer());
}

const spies = {
  init: initSpy,
  initReactI18next,
  use: useSpy,
  useQuery: useQuerySpy,
};

const mocks = {
  i18next,
  loaderProviderResponse,
  translations,
  useQuery: {
    pending: {
      response: useQueryPendingResponse,
    },
    success: {
      empty: useQuerySuccessResponse,
      withData: useQuerySuccessWithDataResponse,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };

export { waitFor } from "@tests";
