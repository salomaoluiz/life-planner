import StockOwnersDTO from "@application/dto/stock/StockOwnersDTO";
import { StockUnits } from "@domain/entities/stock/StockEntity";

const StockUnitLabels: Record<StockUnits, string> = {
  [StockUnits.GRAM]: "Gram",
  [StockUnits.KILOGRAM]: "Kilogram",
  [StockUnits.LITER]: "Liter",
  [StockUnits.MILLILITER]: "Milliliter",
  [StockUnits.UNIT]: "Unit",
};

interface INewStockItemViewModel {
  stockOwnersDTO: StockOwnersDTO[];
}

class NewStockItemViewModel {
  get stockOwners() {
    return this._stockOwnersDTO.map((owner) => ({
      label: `${owner.type.toUpperCase()} - ${owner.name}`,
      value: owner.id,
    }));
  }

  get stockUnits() {
    const stockUnits: Array<{ label: string; value: StockUnits }> = [];

    for (const key in StockUnitLabels) {
      stockUnits.push({
        label: StockUnitLabels[key as StockUnits],
        value: key as StockUnits,
      });
    }

    return stockUnits;
  }

  private _stockOwnersDTO: StockOwnersDTO[];

  constructor(props: INewStockItemViewModel) {
    this._stockOwnersDTO = props.stockOwnersDTO;
  }

  stockOwnerType(ownerId: string) {
    return this._stockOwnersDTO.find((owner) => owner.id === ownerId)!.type;
  }
}

export default NewStockItemViewModel;
