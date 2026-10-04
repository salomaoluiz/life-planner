import { renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import useListItem from "../";
import { makeTransactionViewModel } from "../../../../mocks/index.mocks";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_transaction",
    },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
const refetch = jest.fn();
const item = makeTransactionViewModel();
// endregion mocks

// region spies
const spies = {
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(status: "error" | "idle" | "success" = "idle") {
  const built = mutation.reset().withStatus(status).build();
  spies.useMutation.mockReturnValue(built as never);

  const hook = renderHook(() => useListItem({ item, refetch }));

  return { ...hook, mutate: built.mutate };
}

const mocks = { item, refetch, useCases };

export { mocks, setup, spies };
