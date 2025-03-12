import { useTranslation as useReactI18NextTranslation } from "react-i18next";

import { UseTranslation } from "@presentation/i18n/types";

function useTranslation(): ReturnType<UseTranslation> {
  const { t } = useReactI18NextTranslation();

  return {
    t,
  };
}

export default useTranslation;
