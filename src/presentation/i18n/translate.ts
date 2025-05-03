import { reactI18NTranslate } from "./react-i18n";
import { TranslationKeys } from "./types";

function translate(key: TranslationKeys, params?: Record<string, string>) {
  return reactI18NTranslate(key, params);
}

export default translate;
