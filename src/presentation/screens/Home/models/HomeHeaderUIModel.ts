import UserDTO from "@application/dto/user/UserDTO";
import { TranslationKeys } from "@presentation/i18n/types";

const MORNING_START = 5;
const AFTERNOON_START = 12;
const EVENING_START = 18;

class HomeHeaderUIModel {
  get avatarName() {
    return this.firstName
      ? (this.user?.name ?? "").trim()
      : (this.user?.email ?? "?");
  }

  get avatarPhotoUrl() {
    return this.user?.photoUrl;
  }

  get greetingKey(): TranslationKeys {
    const hour = this.now.getHours();
    const suffix = this.firstName ? "" : "NoName";

    if (hour >= MORNING_START && hour < AFTERNOON_START) {
      return `home.greeting.morning${suffix}` as TranslationKeys;
    }
    if (hour >= AFTERNOON_START && hour < EVENING_START) {
      return `home.greeting.afternoon${suffix}` as TranslationKeys;
    }
    return `home.greeting.evening${suffix}` as TranslationKeys;
  }

  get greetingParams() {
    return this.firstName ? { name: this.firstName } : undefined;
  }

  get overline() {
    return new Intl.DateTimeFormat(this.languageTag, {
      day: "numeric",
      month: "long",
      weekday: "long",
    }).format(this.now);
  }

  private get firstName() {
    return (this.user?.name ?? "").trim().split(/\s+/)[0];
  }

  constructor(
    private readonly user: undefined | UserDTO,
    private readonly now: Date,
    private readonly languageTag: string,
  ) {}
}

export default HomeHeaderUIModel;
