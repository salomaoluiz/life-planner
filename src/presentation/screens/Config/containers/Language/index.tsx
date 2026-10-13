import { useState } from "react";

import { SelectField } from "@components";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";

function Language() {
  const { availableLanguages, changeLocale, getLocale } =
    useTranslationLocale();
  const { t } = useTranslation();
  const [localLanguage, setLocalLanguage] = useState(getLocale().languageTag);

  function onChange(value: string) {
    setLocalLanguage(value);
    changeLocale(value);
  }

  return (
    <SelectField
      closeLabel={t("common.actions.close")}
      label={t("configurations.configs.language.title")}
      onChange={onChange}
      options={availableLanguages.map((locale) => ({
        label: locale,
        value: locale,
      }))}
      sheetTitle={t("configurations.configs.language.title")}
      testID="language-picker"
      value={localLanguage}
    />
  );
}

export default Language;
