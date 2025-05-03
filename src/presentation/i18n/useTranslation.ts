import { reactI18NHooks } from "./react-i18n";
import { UseTranslation } from "./types";

function useTranslation(): ReturnType<UseTranslation> {
  return reactI18NHooks.useTranslation();
}

export default useTranslation;
