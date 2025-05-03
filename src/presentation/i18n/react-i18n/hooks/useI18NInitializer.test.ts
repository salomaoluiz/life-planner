import { mocks, setup, spies, waitFor } from "./mocks/useI18NInitializer.mocks";

it("SHOULD not initialize if the query is pending", () => {
  setup();

  expect(spies.init).not.toHaveBeenCalled();
  expect(spies.use).not.toHaveBeenCalled();
});

it("SHOULD use the react-i18next in success of query", () => {
  spies.useQuery.mockReturnValueOnce(mocks.useQuery.success.empty);

  setup();

  expect(spies.use).toHaveBeenCalledTimes(1);
  expect(spies.use).toHaveBeenCalledWith(spies.initReactI18next);
});

it("SHOULD init with correct params IN success of query empty", () => {
  spies.useQuery.mockReturnValueOnce(mocks.useQuery.success.empty);

  setup();

  expect(spies.init).toHaveBeenCalledTimes(1);
  expect(spies.init).toHaveBeenCalledWith({
    fallbackLng: "en-US",
    lng: mocks.i18next.language,
    resources: {
      "en-US": mocks.translations["en-US"],
      "pt-BR": mocks.translations["pt-BR"],
    },
  });
});

it("SHOULD init with correct params IN success of query with saved language", () => {
  spies.useQuery.mockReturnValueOnce(mocks.useQuery.success.withData);

  setup();

  expect(spies.init).toHaveBeenCalledTimes(1);
  expect(spies.init).toHaveBeenCalledWith({
    fallbackLng: "en-US",
    lng: mocks.useQuery.success.withData.data?.language,
    resources: {
      "en-US": mocks.translations["en-US"],
      "pt-BR": mocks.translations["pt-BR"],
    },
  });
});

it("SHOULD set i18n loading as false in provider loader hook", async () => {
  spies.useQuery.mockReturnValueOnce(mocks.useQuery.success.empty);

  setup();

  await waitFor(() => {
    expect(mocks.loaderProviderResponse.setIsLoading).toHaveBeenCalledTimes(1);
  });
  expect(mocks.loaderProviderResponse.setIsLoading).toHaveBeenCalledWith(
    false,
    "i18n",
  );
});
