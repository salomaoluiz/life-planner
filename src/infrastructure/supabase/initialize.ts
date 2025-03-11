import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addBreadcrumb } from "@infrastructure/monitoring";

function initialize() {
  const envs = process.env;

  const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ||
    envs.EXPO_PUBLIC_SUPABASE_URL) as string;

  const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    envs.EXPO_PUBLIC_SUPABASE_ANON_KEY) as string;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration");
  }

  addBreadcrumb({
    category: "supabase",
    message: "Supabase initialized",
    level: "info",
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: "supabase.tokens",
    },
  });
}

export default initialize;
