import { UseTranslation } from "@presentation/i18n/types";
import { useTranslation as useReactI18NextTranslation } from "react-i18next";

function useTranslation(): ReturnType<UseTranslation> {
  const { t } = useReactI18NextTranslation();

  return {
    t,
  };
}

export default useTranslation;
