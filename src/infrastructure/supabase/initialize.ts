import { createClient } from "@supabase/supabase-js";

import { addBreadcrumb } from "@infrastructure/monitoring";
import { asyncStorage } from "@infrastructure/storage";
import { isWeb } from "@utils/platform";

function initialize() {
  const envs = process.env;

  const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ??
    envs.EXPO_PUBLIC_SUPABASE_URL) as string;

  const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    envs.EXPO_PUBLIC_SUPABASE_ANON_KEY) as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  addBreadcrumb({
    category: "supabase",
    level: "info",
    message: "Supabase initialized",
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: {
        getItem: asyncStorage.getString,
        isServer: isWeb(),
        removeItem: asyncStorage.deleteItem,
        setItem: asyncStorage.setString,
      },
      storageKey: "supabase.tokens",
    },
  });
}

export default initialize;
