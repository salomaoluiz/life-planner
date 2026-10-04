import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { View } from "react-native";

import { render } from "@tests";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import StockViewModel from "@screens/Stock/models/StockViewModel";
import { isWeb } from "@utils/platform";

import Stock from "../";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));
jest.mock("@application/useCases", () => ({
  useCases: {
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
    getStockItemsUseCase: { execute: jest.fn(), uniqueName: "get_stock" },
  },
}));
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});
jest.mock("@screens/Stock/containers/StockCard", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({
      item,
      refetch,
    }: {
      item: { description: string };
      refetch: () => void;
    }) => (
      <MockView onPress={refetch} testID="stockCard" title={item.description} />
    ),
  };
});

// region mocks
const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

const stockDTOs = [
  new StockDTO({
    description: "Rice",
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "owner-1",
    quantity: 2,
    unit: StockUnits.KILOGRAM,
  }),
  new StockDTO({
    description: "Milk",
    id: "stock-2",
    owner: StockOwners.FAMILY,
    ownerId: "owner-2",
    quantity: 1,
    unit: StockUnits.LITER,
  }),
];

const query = new UseQueryFixture<StockViewModel[]>();
// endregion mocks

// region spies
const spies = {
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  getStockItems: jest.mocked(useCases.getStockItemsUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  isWeb: jest.mocked(isWeb),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.isFocused.mockReturnValue(false);
  spies.isWeb.mockReturnValue(false);
});

function setup(props?: {
  focused?: boolean;
  isFetching?: boolean;
  items?: StockViewModel[];
}) {
  spies.isFocused.mockReturnValue(!!props?.focused);
  query.reset().withIsFetching(!!props?.isFetching);
  if (props?.items) {
    query.withData(props.items);
  }
  const built = query.build();
  spies.useQuery.mockReturnValue(built as never);

  render(<Stock />);

  return { refetch: built.refetch };
}

const mocks = {
  items: stockDTOs.map((dto) => new StockViewModel(dto, owners)),
  owners,
  stockDTOs,
  useCases,
  View,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
