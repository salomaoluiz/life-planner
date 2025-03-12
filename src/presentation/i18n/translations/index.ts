import enUS from "./en-US";
import ptBR from "./pt-BR";

export const translations = {
  "en-US": enUS,
  "pt-BR": ptBR,
};

export const availableLanguages = ["en-US", "pt-BR"] as const;

export const fallbackLanguage = "en-US";
