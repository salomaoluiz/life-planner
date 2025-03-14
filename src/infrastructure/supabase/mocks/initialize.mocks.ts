import * as supabase from "@supabase/supabase-js";

import * as monitoring from "@infrastructure/monitoring";
import { asyncStorage } from "@infrastructure/storage";
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
const getStringSpy = jest.spyOn(asyncStorage, "getString");
const deleteItemSpy = jest.spyOn(asyncStorage, "deleteItem");
const setStringSpy = jest.spyOn(asyncStorage, "setString");

function setup() {
  return initialize();
}

const spies = {
  addBreadcrumb: addBreadcrumbSpy,
  createClient: createClientSpy,
  deleteItem: deleteItemSpy,
  getString: getStringSpy,
  setString: setStringSpy,
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
