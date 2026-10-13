import { render } from "@tests";

import FinancialAccounts from "../";
import { useAccountsViewModel } from "../hooks";
import { AccountEntry } from "../models/accountList";
import AccountUIModel from "../models/AccountUIModel";
import { makeAccountDTO, owners } from "./index.mocks";

jest.mock("../hooks");
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      ListEmptyComponent,
      ListHeaderComponent,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});

const defaultViewModel: ReturnType<typeof useAccountsViewModel> = {
  archivedCount: 0,
  entries: [],
  errorMessage: undefined,
  isEmpty: false,
  isLoading: false,
  isRefreshing: false,
  onAddPress: jest.fn(),
  onArchivedToggle: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  onRowPress: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  totalAmount: { value: 0 },
};

function makeEntries(expanded = false): AccountEntry[] {
  const checking = new AccountUIModel(
    makeAccountDTO({ id: "acc-1", name: "Checking" }),
    owners,
  );
  const card = new AccountUIModel(
    makeAccountDTO({ balance: -20.5, id: "acc-2", name: "Card" }),
    owners,
  );
  const old = new AccountUIModel(
    makeAccountDTO({ id: "acc-3", name: "Old", status: "ARCHIVED" }),
    owners,
  );
  const entries: AccountEntry[] = [
    {
      key: "section-active",
      kind: "section",
      titleKey: "financial.accounts.active",
    },
    { account: card, key: "row-acc-2", kind: "row" },
    { account: checking, key: "row-acc-1", kind: "row" },
    { count: 2, expanded, key: "archived-toggle", kind: "archivedToggle" },
  ];
  if (expanded) {
    entries.push({ account: old, key: "row-acc-3", kind: "row" });
  }

  return entries;
}

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useAccountsViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<FinancialAccounts />);
}

export { defaultViewModel, makeEntries, setup };
