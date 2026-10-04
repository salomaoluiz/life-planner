import { useIsFocused } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";

import { render } from "@tests";

import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import FinancialAccounts from "../";
import FinancialAccountViewModel from "../models/FinancialAccountViewModel";
import { makeAccountDTO, owners } from "./index.mocks";

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
    getFinancialAccountsUseCase: {
      execute: jest.fn(),
      uniqueName: "get_accounts",
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
const query = new UseQueryFixture<FinancialAccountViewModel[]>();
const setOptions = jest.fn();

const dtos = [
  makeAccountDTO({ id: "acc-1", name: "Checking" }),
  makeAccountDTO({ id: "acc-2", name: "Savings" }),
];
// endregion mocks

// region spies
const spies = {
  getAccounts: jest.mocked(useCases.getFinancialAccountsUseCase.execute),
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
  items?: FinancialAccountViewModel[];
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

  render(<FinancialAccounts />);

  return { refetch: built.refetch };
}

const mocks = {
  dtos,
  items: dtos.map((dto) => new FinancialAccountViewModel(dto, owners)),
  owners,
  setOptions,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
