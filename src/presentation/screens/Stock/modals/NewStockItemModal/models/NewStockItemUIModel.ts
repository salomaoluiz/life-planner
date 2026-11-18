import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

// Spec 116: Unidade / Peso (g/kg) / Volume (ml/L).
const UnitOptions: Array<{ labelKey: TranslationKeys; value: StockUnits }> = [
  { labelKey: "stock.form.unitKind.unit", value: StockUnits.UNIT },
  { labelKey: "stock.form.unitKind.weight", value: StockUnits.KILOGRAM },
  { labelKey: "stock.form.unitKind.volume", value: StockUnits.LITER },
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

  ownerName(ownerId: string) {
    return this.owners.find((item) => item.id === ownerId)?.name ?? "";
  }

  ownerType(ownerId: string): StockOwners {
    const owner = this.owners.find((item) => item.id === ownerId);

    return owner?.type === OwnerType.FAMILY
      ? StockOwners.FAMILY
      : StockOwners.USER;
  }
}

export default NewStockItemUIModel;
