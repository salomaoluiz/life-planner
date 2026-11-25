import { StockBarcodeMatchDTO } from "@application/dto/stock/StockBarcodeDTO";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";
import StockItemUIModel, {
  StockBadge,
} from "@screens/Stock/models/StockItemUIModel";

// What the quick sheet and the owner picker show of one matched item (spec 121 FR 8-10).
class BarcodeMatchUIModel {
  get badges(): StockBadge[] {
    return this.item.badges;
  }

  // Abri: hidden without a shelf life, with an open lot or without stock (117).
  get canOpen() {
    return this.item.canOpen && !this.match.readOnly;
  }

  get name() {
    return this.match.item.description;
  }

  get ownerName() {
    return this.match.ownerName;
  }

  // "Pessoal"/"[Família]" and the place of the item, for the owner picker.
  get pickerSubtitle() {
    return [this.match.item.description, this.match.item.location?.name]
      .filter(Boolean)
      .join(" · ");
  }

  get quantity(): { text: string; unitKey: TranslationKeys } {
    return formatQuantity(
      this.match.item.quantity,
      this.match.item.unit,
      this.locale,
    );
  }

  get readOnly() {
    return this.match.readOnly;
  }

  // "Pessoal · Geladeira · Laticínios"
  get subtitle() {
    return [
      this.match.ownerName,
      this.match.item.location?.name,
      this.match.item.category?.name,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  private readonly item: StockItemUIModel;

  constructor(
    readonly match: StockBarcodeMatchDTO,
    private readonly locale: string,
  ) {
    this.item = new StockItemUIModel(match.item, [], locale);
  }
}

export default BarcodeMatchUIModel;
