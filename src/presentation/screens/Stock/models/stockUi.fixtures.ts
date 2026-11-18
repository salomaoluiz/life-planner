import StockDTOFixture from "@application/dto/stock/mocks/StockDTO.fixture";
import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  StockExpirationStatus,
  StockOwners,
  StockUnits,
} from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Silva", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "family-2",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];

export function dto(
  build: (fixture: StockDTOFixture) => StockDTOFixture = (fixture) => fixture,
): StockDTO {
  return build(
    new StockDTOFixture()
      .withDefault()
      .withOwnerId("user-id")
      .withBarcode("000"),
  ).build() as StockDTO;
}

export function expired(id: string) {
  return dto((f) =>
    f
      .withId(id)
      .withDescription(`Expired ${id}`)
      .withExpirationStatus(StockExpirationStatus.EXPIRED)
      .withNearestExpiration(new Date(2026, 9, 1)),
  );
}
export function expiring(id: string) {
  return dto((f) =>
    f
      .withId(id)
      .withDescription(`Expiring ${id}`)
      .withExpirationStatus(StockExpirationStatus.EXPIRING)
      .withNearestExpiration(new Date(2026, 9, 8)),
  );
}
export function familyItem(id: string, ownerId = "family-1") {
  return dto((f) =>
    f
      .withId(id)
      .withDescription(`Family ${id}`)
      .withOwner(StockOwners.FAMILY)
      .withOwnerId(ownerId),
  );
}
export function fine(id: string) {
  return dto((f) =>
    f
      .withId(id)
      .withDescription(`Fine ${id}`)
      .withExpirationStatus(StockExpirationStatus.OK)
      .withNearestExpiration(new Date(2026, 10, 20)),
  );
}
export function low(id: string) {
  return dto((f) =>
    f
      .withId(id)
      .withDescription(`Low ${id}`)
      .withUnit(StockUnits.KILOGRAM)
      .withQuantity(0.25)
      .withMinQuantity(0.3, 1)
      .withNeedsRestock(),
  );
}
