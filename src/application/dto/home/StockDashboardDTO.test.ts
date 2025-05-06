import StockDTO from "@application/dto/stock/StockDTO";

import { mocks, setupFromEntity } from "./mocks/StockDashboardDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual({
    stockDTOs: [
      new StockDTO({
        barcode: mocks.defaultProps.stockDTOs[0].barcode,
        brand: mocks.defaultProps.stockDTOs[0].brand,
        description: mocks.defaultProps.stockDTOs[0].description,
        expirationDate: mocks.defaultProps.stockDTOs[0].expirationDate,
        id: mocks.defaultProps.stockDTOs[0].id,
        notes: mocks.defaultProps.stockDTOs[0].notes,
        openingDate: mocks.defaultProps.stockDTOs[0].openingDate,
        owner: mocks.defaultProps.stockDTOs[0].owner,
        ownerId: mocks.defaultProps.stockDTOs[0].ownerId,
        purchaseDate: mocks.defaultProps.stockDTOs[0].purchaseDate,
        quantity: mocks.defaultProps.stockDTOs[0].quantity,
        unit: mocks.defaultProps.stockDTOs[0].unit,
      }),
    ],
  });
});
