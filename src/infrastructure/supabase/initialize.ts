import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addBreadcrumb } from "@infrastructure/monitoring";

function initialize() {
  const envs = process.env;

  if (!envs.EXPO_PUBLIC_SUPABASE_URL || !envs.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  addBreadcrumb({
    category: "supabase",
    message: "Supabase initialized",
    level: "info",
  });

  return createClient(
    envs.EXPO_PUBLIC_SUPABASE_URL,
    envs.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: "supabase.tokens",
      },
    },
  );
}

export default initialize;
