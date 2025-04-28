import { useState } from "react";

import { Picker, Spacer, Text } from "@components";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";

function Language() {
  const { availableLanguages, changeLocale, getLocale } =
    useTranslationLocale();
  const { t } = useTranslation();
  const [localLanguage, setLocalLanguage] = useState(getLocale().languageTag);
  return (
    <>
      <Text.Title value={t("configurations.configs.language.title")} />
      <Spacer direction={"horizontal"} horizontalLine size={"flex"} />
      <Picker
        items={availableLanguages.map((locale) => ({
          label: locale,
          value: locale,
        }))}
        onValueChange={(newValue) => {
          setLocalLanguage(newValue);
          changeLocale(newValue);
        }}
        selectedValue={localLanguage}
      />
    </>
  );
}

export default Language;
