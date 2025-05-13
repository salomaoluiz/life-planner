import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import createStockItem, { Params } from "../createStockItem";

// region mocks
const defaultParams: Params = {
  barcode: "1234567890123",
  brand: "Brand",
  description: "Description",
  expirationDate: new Date(),
  notes: "Notes",
  openingDate: new Date(),
  owner: "FAMILY",
  ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
  purchaseDate: new Date(),
  quantity: 1,
  unit: "KG",
};

const responseSuccess = {
  data: [
    {
      barcode: "1234567890123",
      brand: "Brand",
      description: "Description",
      expirationDate: new Date(),
      notes: "Notes",
      openingDate: new Date(),
      owner: "FAMILY",
      ownerId: "cfe141b7-37e0-4d58-aa13-9b6c5a9b7030",
      purchaseDate: new Date(),
      quantity: 1,
      unit: "KG",
    },
  ],
  error: null,
};

const unknownError = {
  data: null,
  error: new Error("Some error"),
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createStockItem({ ...defaultParams, ...params });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultParams,
  errors: {
    unknown: unknownError,
  },
  success: {
    response: responseSuccess,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
