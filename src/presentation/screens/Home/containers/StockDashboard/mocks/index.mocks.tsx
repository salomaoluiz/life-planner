import { useIsFocused } from "@react-navigation/native";

import { render } from "@tests";

import StockDashboardDTO from "@application/dto/home/StockDashboardDTO";
import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import StockDashboardViewModel from "@screens/Home/models/StockDashboardViewModel";

import StockDashboard from "../";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getStockDashboardUseCase: { execute: jest.fn(), uniqueName: "dashboard" },
  },
}));
jest.mock("@components/Skeleton", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: {
      Box: (props: object) => <MockView testID="skeleton" {...props} />,
    },
  };
});

// region mocks
const stockDTOs = [
  new StockDTO({
    description: "Rice",
    expirationDate: new Date("2024-12-01T00:00:00Z"),
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "owner-1",
    quantity: 2,
    unit: StockUnits.UNIT,
  }),
  new StockDTO({
    description: "Milk",
    id: "stock-2",
    owner: StockOwners.FAMILY,
    ownerId: "owner-2",
    quantity: 0,
    unit: StockUnits.LITER,
  }),
];
const dashboardDTO = new StockDashboardDTO({ stockDTOs });
const query = new UseQueryFixture<StockDashboardViewModel>();
// endregion mocks

// region spies
const spies = {
  getDashboard: jest.mocked(useCases.getStockDashboardUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: {
  focused?: boolean;
  isFetching?: boolean;
  loaded?: boolean;
}) {
  spies.isFocused.mockReturnValue(!!props?.focused);
  query.reset().withIsFetching(!!props?.isFetching);
  if (props?.loaded !== false) {
    query.withData(
      new StockDashboardViewModel({ stockDashboardDTO: dashboardDTO }),
    );
  }
  const built = query.build();
  spies.useQuery.mockReturnValue(built as never);

  render(<StockDashboard />);

  return { refetch: built.refetch };
}

const mocks = { dashboardDTO };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
