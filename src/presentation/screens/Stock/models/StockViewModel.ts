import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners } from "@domain/entities/stock/StockEntity";
import { difference, Duration } from "@infrastructure/date";

class StockViewModel {
  get dates() {
    return {
      expirationDate: this.dto.expirationDate?.toLocaleDateString(),
      openingDate: this.dto.openingDate?.toLocaleDateString(),
      purchaseDate: this.dto.purchaseDate?.toLocaleDateString(),
    };
  }

  get description() {
    return this.dto.description;
  }

  get ids() {
    return {
      itemId: this.dto.id,
      ownerId: this.dto.ownerId,
    };
  }

  get isCloseToExpiration() {
    if (!this.dto.expirationDate) {
      return false;
    }

    const today = new Date();
    const differenceInDays = difference(
      today,
      this.dto.expirationDate,
      Duration.days,
    );

    return differenceInDays <= 7;
  }

  get isExpired() {
    if (!this.dto.expirationDate) {
      return false;
    }

    return this.dto.expirationDate < new Date();
  }

  get owner() {
    const ownerName = this.ownersDTO.find(
      (owner) => owner.id === this.dto.ownerId,
    )?.name;
    const ownerType =
      this.dto.owner === StockOwners.FAMILY ? "Family" : "Personal";

    return `${ownerName} (${ownerType})`;
  }

  get quantity() {
    return `${this.dto.quantity} ${this.dto.unit}`;
  }

  get status() {
    if (this.isExpired) {
      return `Expired on ${this.dates.expirationDate}`;
    }

    if (this.isCloseToExpiration) {
      return "Close to expiration";
    }

    if (this.dto.quantity === 0) {
      return "Out of stock";
    }

    return "In stock";
  }

  private dto: StockDTO;
  private ownersDTO: OwnerDTO[];

  constructor(dto: StockDTO, owners: OwnerDTO[]) {
    this.dto = dto;
    this.ownersDTO = owners;
  }
}

export default StockViewModel;
