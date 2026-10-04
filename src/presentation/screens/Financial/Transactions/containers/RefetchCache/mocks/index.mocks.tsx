import { render } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import RefetchCache from "../";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    refreshFinancialTransactionsUseCase: {
      execute: jest.fn(),
      uniqueName: "refresh_transactions",
    },
  },
}));

// region mocks
const mutation = new UseMutationFixture<void, void>();
const refetchQuery = jest.fn();
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

  render(<RefetchCache refetchQuery={refetchQuery} />);

  return { mutate: built.mutate };
}

const mocks = { refetchQuery, useCases };

export { mocks, setup, spies };
export { fireEvent, screen } from "@tests";
