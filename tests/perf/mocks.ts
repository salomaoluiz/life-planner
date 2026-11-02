// Side-effect module: import it FIRST in every `__perf__` test. It replaces only the HTTP transport (and what
// would touch the device) so the real view models, use cases, repositories and datasources run.
jest.unmock("@tanstack/react-query");
jest.mock(
  "@infrastructure/api/transport",
  () => jest.requireActual("@tests/perf/networkHarness").transportMock,
);
jest.mock(
  "@infrastructure/api/refresh",
  () => jest.requireActual("@tests/perf/networkHarness").refreshMock,
);
jest.mock("@infrastructure/token", () => ({
  tokenStorage: { getToken: async () => "token" },
}));
jest.mock("@infrastructure/storage/init", () => {
  function memory() {
    const map = new Map<string, string>();

    return {
      clearAll: () => map.clear(),
      delete: (key: string) => map.delete(key),
      getAllKeys: () => [...map.keys()],
      getString: (key: string) => map.get(key),
      set: (key: string, value: string) => map.set(key, value),
    };
  }

  return { cache: memory(), storage: memory() };
});
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
  usePathname: () => "/",
}));
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({
    closeModal: jest.fn(),
    openModal: jest.fn(),
    replaceModal: jest.fn(),
  }),
}));
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
