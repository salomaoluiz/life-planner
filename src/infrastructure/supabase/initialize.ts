import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sentryAddBreadcrumb } from "@infrastructure/monitoring/sentry";

function initialize() {
  if (
    !process.env.EXPO_PUBLIC_SUPABASE_URL ||
    !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Missing Supabase configuration");
  }

  sentryAddBreadcrumb({
    category: "supabase",
    message: "Supabase initialized",
    level: "info",
  });

  return createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
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
