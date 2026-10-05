import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { useEffect } from "react";

import { captureException } from "@infrastructure/monitoring";

const fontFiles = {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

export function useAppFonts(): { failed: boolean; ready: boolean } {
  const [loaded, error] = useFonts(fontFiles);

  useEffect(() => {
    if (error) {
      captureException(error, { action: "Using the system font" });
    }
  }, [error]);

  return { failed: Boolean(error), ready: loaded || Boolean(error) };
}
