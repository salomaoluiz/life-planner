import { useIsFocused } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";

import { render } from "@tests";

import { useCases } from "@application/useCases";
import { Picker } from "@components";
import { GenericError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import FinancialCategories from "../";
import FinancialCategoryViewModel from "../models/FinancialCategoryViewModel";
import { makeCategoryDTO, owners } from "./index.mocks";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useNavigation: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "get_categories",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
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
jest.mock("../containers/ListItem", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({
      item,
      refetch,
    }: {
      item: { name: string };
      refetch: () => void;
    }) => <MockView onPress={refetch} testID="listItem" title={item.name} />,
  };
});
jest.mock("@screens/Financial/Transactions/containers/RefetchCache", () => ({
  __esModule: true,
  default: () => null,
}));

// region mocks
const query = new UseQueryFixture<FinancialCategoryViewModel[]>();
const setOptions = jest.fn();

const dtos = [
  makeCategoryDTO({ id: "cat-child", name: "Uber", parentId: "cat-root" }),
  makeCategoryDTO({ id: "cat-root", name: "Transport" }),
  makeCategoryDTO({ id: "cat-salary", name: "Salary", type: "INCOME" }),
];
// endregion mocks

// region spies
const spies = {
  getCategories: jest.mocked(useCases.getFinancialCategoriesUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useNavigation: jest.mocked(useNavigation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.useNavigation.mockReturnValue({ setOptions } as never);
});

function setup(props?: {
  error?: boolean;
  focused?: boolean;
  isFetching?: boolean;
  items?: FinancialCategoryViewModel[];
}) {
  spies.isFocused.mockReturnValue(!!props?.focused);
  query.reset().withIsFetching(!!props?.isFetching);
  if (props?.items) {
    query.withData(props.items);
  }
  if (props?.error) {
    query.withError(new GenericError());
  }
  const built = query.build();
  spies.useQuery.mockReturnValue(built as never);

  render(<FinancialCategories />);

  return { refetch: built.refetch };
}

const mocks = {
  dtos,
  items: dtos.map((dto) => new FinancialCategoryViewModel(dto, owners)),
  owners,
  Picker,
  setOptions,
};

export { mocks, setup, spies };
export { act, fireEvent, hasText, screen } from "@tests";
