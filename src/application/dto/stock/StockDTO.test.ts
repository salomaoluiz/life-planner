import StockDTO from "@application/dto/stock/StockDTO";

import { mocks, setupFromEntity } from "./mocks/StockDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new StockDTO({
      barcode: mocks.defaultProps.barcode,
      brand: mocks.defaultProps.brand,
      description: mocks.defaultProps.description,
      expirationDate: mocks.defaultProps.expirationDate,
      id: mocks.defaultProps.id,
      notes: mocks.defaultProps.notes,
      openingDate: mocks.defaultProps.openingDate,
      owner: mocks.defaultProps.owner,
      ownerId: mocks.defaultProps.ownerId,
      purchaseDate: mocks.defaultProps.purchaseDate,
      quantity: mocks.defaultProps.quantity,
      unit: mocks.defaultProps.unit,
    }),
  );
});
