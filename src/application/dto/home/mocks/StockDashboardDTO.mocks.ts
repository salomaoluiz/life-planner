import StockDTOFixture from "@application/dto/stock/mocks/StockDTO.fixture";
import StockEntity from "@domain/entities/stock/StockEntity";

import StockDashboardDTO, { IStockDashboardDTO } from "../StockDashboardDTO";

// region mocks

const stockDTOFixture = new StockDTOFixture();

const defaultProps: IStockDashboardDTO = {
  stockDTOs: [stockDTOFixture.withDefault().build()],
};

const defaultStockEntity = new StockEntity({
  barcode: defaultProps.stockDTOs[0].barcode,
  brand: defaultProps.stockDTOs[0].brand,
  description: defaultProps.stockDTOs[0].description,
  expirationDate: defaultProps.stockDTOs[0].expirationDate,
  id: defaultProps.stockDTOs[0].id,
  notes: defaultProps.stockDTOs[0].notes,
  openingDate: defaultProps.stockDTOs[0].openingDate,
  owner: defaultProps.stockDTOs[0].owner,
  ownerId: defaultProps.stockDTOs[0].ownerId,
  purchaseDate: defaultProps.stockDTOs[0].purchaseDate,
  quantity: defaultProps.stockDTOs[0].quantity,
  unit: defaultProps.stockDTOs[0].unit,
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: StockEntity[] = [defaultStockEntity]) {
  return StockDashboardDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
