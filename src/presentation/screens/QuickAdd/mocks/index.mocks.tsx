import { router } from "expo-router";

import { render } from "@tests";

import { quickMock } from "@screens/Stock/mocks/quick.mocks";

import QuickAdd from "../";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
}));
jest.mock("@infrastructure/fetcher", () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status: "pending",
  })),
}));
jest.mock("@presentation/hooks/useOwners", () => ({
  __esModule: true,
  default: () => ({ data: [], refetch: jest.fn() }),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status: "pending",
  })),
}));
jest.mock("@screens/Stock/hooks/useStockQuickMovement", () => ({
  __esModule: true,
  default: () =>
    jest.requireActual("@screens/Stock/mocks/quick.mocks").quickMock(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<QuickAdd />);
}

const spies = {
  back: jest.mocked(router.back),
  replace: jest.mocked(router.replace),
};

export { quickMock, setup, spies };
