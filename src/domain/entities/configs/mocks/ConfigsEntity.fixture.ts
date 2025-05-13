import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";
import { availableLanguages } from "@presentation/i18n/translations";

class ConfigsEntityFixture {
  value = {} as ConfigsEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as ConfigsEntity;
  }

  withDarkMode(darkMode: boolean) {
    this.value.darkMode = darkMode;
    return this;
  }

  withDefault() {
    this.value = {
      darkMode: false,
      language: "en-US",
    };
    return this;
  }

  withLanguage(language: (typeof availableLanguages)[number]) {
    this.value.language = language;

    return this;
  }
}

export default ConfigsEntityFixture;
