import ConfigsEntity, {
  ThemeMode,
} from "@domain/entities/configs/ConfigsEntity";
import { availableLanguages } from "@presentation/i18n/translations";

class ConfigsEntityFixture {
  value = {} as ConfigsEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as ConfigsEntity;
  }

  withDefault() {
    this.value = {
      language: "en-US",
      themeMode: ThemeMode.SYSTEM,
    };
    return this;
  }

  withLanguage(language: (typeof availableLanguages)[number]) {
    this.value.language = language;

    return this;
  }

  withThemeMode(themeMode: ThemeMode) {
    this.value.themeMode = themeMode;

    return this;
  }
}

export default ConfigsEntityFixture;
