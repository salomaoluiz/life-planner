import ptBR from "./pt-BR";
import enUS from "./en-US";

export const translations = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

export const availableLanguages = ["en-US", "pt-BR"] as const;

export const fallbackLanguage = "en-US";
