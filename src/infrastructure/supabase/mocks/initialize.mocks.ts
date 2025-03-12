import AsyncStorage from "@react-native-async-storage/async-storage";
import * as supabase from "@supabase/supabase-js";

import * as monitoring from "@infrastructure/monitoring";
import initialize from "@infrastructure/supabase/initialize";

// #region mock

const createClientResponse = {
  authUrl: "Auth URL",
} as never as ReturnType<typeof supabase.createClient>;

// #endregion

const addBreadcrumbSpy = jest.spyOn(monitoring, "addBreadcrumb");
const createClientSpy = jest
  .spyOn(supabase, "createClient")
  .mockReturnValue(createClientResponse);

function setup() {
  return initialize();
}

const spies = {
  addBreadcrumb: addBreadcrumbSpy,
  AsyncStorage,
  createClient: createClientSpy,
};

const mocks = {
  createClientResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://your-supabase-url";
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "your-supabase-anon-key";
});

export { mocks, setup, spies };
