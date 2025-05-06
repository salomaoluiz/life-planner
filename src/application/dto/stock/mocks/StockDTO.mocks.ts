import StockDTOFixture from "@application/dto/stock/mocks/StockDTO.fixture";
import StockEntity from "@domain/entities/stock/StockEntity";

import StockDTO, { IStockDTO } from "../StockDTO";

// region mocks
const stockDTOFixture = new StockDTOFixture();

const defaultProps: IStockDTO = stockDTOFixture.withDefault().build();

const defaultStockEntity = new StockEntity({
  barcode: defaultProps.barcode,
  brand: defaultProps.brand,
  description: defaultProps.description,
  expirationDate: defaultProps.expirationDate,
  id: defaultProps.id,
  notes: defaultProps.notes,
  openingDate: defaultProps.openingDate,
  owner: defaultProps.owner,
  ownerId: defaultProps.ownerId,
  purchaseDate: defaultProps.purchaseDate,
  quantity: defaultProps.quantity,
  unit: defaultProps.unit,
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: StockEntity = defaultStockEntity) {
  return StockDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
