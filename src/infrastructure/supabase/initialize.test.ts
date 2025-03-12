import { mocks, setup, spies } from "./mocks/initialize.mocks";

it("SHOULD initialize supabase", () => {
  const result = setup();

  expect(spies.addBreadcrumb).toHaveBeenCalledTimes(1);
  expect(spies.addBreadcrumb).toHaveBeenCalledWith({
    category: "supabase",
    level: "info",
    message: "Supabase initialized",
  });

  expect(spies.createClient).toHaveBeenCalledTimes(1);
  expect(spies.createClient).toHaveBeenCalledWith(
    "https://your-supabase-url",
    "your-supabase-anon-key",
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: spies.AsyncStorage,
        storageKey: "supabase.tokens",
      },
    },
  );

  expect(result).toEqual(mocks.createClientResponse);
});

it("SHOULD throw an error WHEN supabase URL is missing", () => {
  process.env.EXPO_PUBLIC_SUPABASE_URL = "";

  expect(setup).toThrow(new Error("Missing Supabase configuration"));
});

it("SHOULD throw an error WHEN supabase anon key is missing", () => {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "";

  expect(setup).toThrow(new Error("Missing Supabase configuration"));
});
