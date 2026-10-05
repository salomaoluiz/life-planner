import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

const UnitOptions: Array<{ labelKey: TranslationKeys; value: StockUnits }> = [
  { labelKey: "stock.units.unit", value: StockUnits.UNIT },
  { labelKey: "stock.units.kilogram", value: StockUnits.KILOGRAM },
  { labelKey: "stock.units.gram", value: StockUnits.GRAM },
  { labelKey: "stock.units.liter", value: StockUnits.LITER },
  { labelKey: "stock.units.milliliter", value: StockUnits.MILLILITER },
];

class NewStockItemUIModel {
  get defaultOwnerId() {
    const preferred = this.owners.find(
      (owner) => owner.id === this.preferredOwnerId,
    );
    const user = this.owners.find((owner) => owner.type === OwnerType.USER);

    return (preferred ?? user ?? this.owners[0])?.id ?? "";
  }

  get ownerOptions(): Array<{
    label: string;
    labelKey?: TranslationKeys;
    value: string;
  }> {
    return this.owners.map((owner) =>
      owner.type === OwnerType.USER
        ? {
            label: owner.name,
            labelKey: "stock.list.filter.personal",
            value: owner.id,
          }
        : { label: owner.name, value: owner.id },
    );
  }

  get unitOptions() {
    return UnitOptions;
  }

  constructor(
    private readonly owners: OwnerDTO[],
    private readonly preferredOwnerId?: string,
  ) {}

  isUnit(value: string): value is StockUnits {
    return UnitOptions.some((option) => option.value === value);
  }

  ownerType(ownerId: string): StockOwners {
    const owner = this.owners.find((item) => item.id === ownerId);

    return owner?.type === OwnerType.FAMILY
      ? StockOwners.FAMILY
      : StockOwners.USER;
  }
}

export default NewStockItemUIModel;
