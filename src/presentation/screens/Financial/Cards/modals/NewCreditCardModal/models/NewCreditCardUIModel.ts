import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CARD_COLORS } from "@presentation/constants/cardColors";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  buildOwnerChoices,
  ChoiceOption,
} from "@screens/Financial/models/ownerOptions";

const BRANDS = ["VISA", "MASTERCARD", "ELO", "AMEX", "OTHER"] as const;
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));

class NewCreditCardUIModel {
  get brandOptions(): ChoiceOption[] {
    return BRANDS.map((brand) => ({
      labelKey: `financial.cards.brand.${brand}` as TranslationKeys,
      value: brand,
    }));
  }

  get colorOptions(): { labelKey: TranslationKeys; value: string }[] {
    return CARD_COLORS;
  }

  get dayOptions(): ChoiceOption[] {
    return DAYS.map((day) => ({ label: day, value: day }));
  }

  get ownerChoices(): ChoiceOption[] {
    return buildOwnerChoices(this.owners);
  }

  // The first option clears the optional payment day (it then follows the due day).
  get paymentDayOptions(): ChoiceOption[] {
    return [
      { labelKey: "financial.cardForm.paymentSameAsDue", value: "" },
      ...this.dayOptions,
    ];
  }

  constructor(private readonly owners: OwnerDTO[]) {}

  owner(ownerId: string): OwnerDTO {
    return this.owners.find((owner) => owner.id === ownerId) ?? this.owners[0];
  }
}

export default NewCreditCardUIModel;
