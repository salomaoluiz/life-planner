import { render } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import StockViewModel from "@screens/Stock/models/StockViewModel";

import StockCard from "../";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteStockItemUseCase: { execute: jest.fn(), uniqueName: "delete_stock" },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();

const item = {
  description: "Rice",
  ids: { itemId: "stock-1", ownerId: "owner-1" },
  isExpired: false,
  owner: "Alice Test (Personal)",
  quantity: "2 kilogram",
  status: "In stock",
} as unknown as StockViewModel;

const refetch = jest.fn();
// endregion mocks

// region spies
const spies = {
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  mutation.reset();
  spies.useMutation.mockReturnValue(mutation.build() as never);
});

function setup(props?: {
  isExpired?: boolean;
  status?: "error" | "idle" | "success";
}) {
  const built = mutation
    .reset()
    .withStatus(props?.status ?? "idle")
    .build();
  spies.useMutation.mockReturnValue(built as never);

  render(
    <StockCard
      item={{ ...item, isExpired: !!props?.isExpired } as StockViewModel}
      refetch={refetch}
    />,
  );

  return { mutate: built.mutate };
}

const mocks = { item, refetch, useCases };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
