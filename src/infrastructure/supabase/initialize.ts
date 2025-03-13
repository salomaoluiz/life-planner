import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { addBreadcrumb } from "@infrastructure/monitoring";

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
      storage: AsyncStorage,
      storageKey: "supabase.tokens",
    },
  });
}

export default initialize;
