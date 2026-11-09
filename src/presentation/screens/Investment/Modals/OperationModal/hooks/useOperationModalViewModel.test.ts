import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { InvestmentNegativePosition } from "@domain/entities/errors";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import {
  InvestmentAssetStatus,
  InvestmentFeeKind,
} from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeOperation,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useOperationModalViewModel from "./useOperationModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    updateInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

function account(
  id: string,
  name: string,
  overrides: Partial<ConstructorParameters<typeof AccountDTO>[0]> = {},
) {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name,
    owner: "USER",
    ownerId: "user-1",
    status: "ACTIVE",
    ...overrides,
  });
}

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const accountsQuery = new UseQueryFixture<AccountsData>();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();
const deleteMutation = new UseMutationFixture();

const spies = {
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useOwnerScoped: jest.mocked(useOwnerScopedQuery),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  detailQuery.reset().withData(makeDetail());
  accountsQuery.reset().withData({
    accounts: [
      account("acc-z", "Zeta"),
      account("acc-1", "Main"),
      account("acc-bk", "Broker", { type: AccountType.BROKERAGE }),
      account("acc-usd", "Dollar", { currency: "USD" }),
      account("acc-old", "Old", { status: "ARCHIVED" }),
      account("acc-fam", "Fam", { owner: "FAMILY", ownerId: "old" }),
    ],
    owners: [
      ...owners,
      new OwnerDTO({
        archived: true,
        id: "old",
        name: "Old",
        type: OwnerType.FAMILY,
      }),
    ],
  });
  createMutation.reset();
  updateMutation.reset();
  deleteMutation.reset();
  spies.params.mockReturnValue({ assetId: "asset-1" });
  spies.useQuery.mockImplementation((() => detailQuery.build()) as never);
  spies.useOwnerScoped.mockImplementation((() =>
    accountsQuery.build()) as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    ({
      create: createMutation,
      delete: deleteMutation,
      update: updateMutation,
    })[props.cacheKey[0]]?.build()) as never);
});

function setup() {
  return renderHook(() => useOperationModalViewModel());
}

it("SHOULD offer the active accounts in the asset currency, brokerage first, none of an archived family", () => {
  const { result } = setup();

  expect(result.current.accountOptions.map((option) => option.value)).toEqual([
    "acc-bk",
    "acc-1",
    "acc-z",
  ]);
  expect(result.current.accountId).toBe("acc-bk");
  expect(result.current.accountOptions[0].label).toBe("Broker · BRL");
});

it("SHOULD start a buy dated today with the finance entry on", () => {
  const { result } = setup();

  expect(result.current.type).toBe("BUY");
  expect(result.current.generate).toBe(true);
  expect(result.current.titleKey).toBe("investment.form.operation.newTitle");
  expect(result.current.saveLabelKey).toBe("investment.form.operation.saveBuy");
});

it("SHOULD preview the new average price AND the totals of a buy", () => {
  const { result } = setup();

  act(() => result.current.onQuantityChange("100"));
  act(() => result.current.onUnitPriceChange("10,53"));

  expect(result.current.preview?.totals.total).toBe(105300);
  expect(result.current.preview?.averagePrice).not.toBeNull();
});

it("SHOULD flag a sell above what was held AND refuse to save it", () => {
  const { result } = setup();

  act(() => result.current.onTypeChange("SELL"));
  act(() => result.current.onQuantityChange("5000"));
  act(() => result.current.onUnitPriceChange("10"));
  act(() => result.current.onSave());

  expect(result.current.insufficient).toBe(true);
  expect(result.current.availableQuantity).toBeDefined();
  expect(result.current.saveLabelKey).toBe(
    "investment.form.operation.saveSell",
  );
  expect(createMutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD validate AND then create the operation", () => {
  const { result } = setup();

  act(() => result.current.onSave());
  expect(result.current.quantityError).toBeDefined();
  expect(result.current.unitPriceError).toBeDefined();
  expect(createMutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onQuantityChange("100"));
  act(() => result.current.onUnitPriceChange("10,53"));
  act(() => result.current.onAddFee());
  act(() => result.current.onFeeAmountChange(result.current.fees[0].key, 490));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      accountId: "acc-bk",
      assetId: "asset-1",
      fees: [{ amount: 490, description: undefined, kind: "BROKERAGE" }],
      generateTransaction: true,
      quantity: "100",
      type: "BUY",
      unitPrice: "10,53",
    }),
  );
});

it("SHOULD edit the fees, the date, the account AND the switch", () => {
  const { result } = setup();

  act(() => result.current.onAddFee());
  const key = result.current.fees[0].key;
  act(() => result.current.onFeeKindChange(key, "OTHER"));
  act(() => result.current.onFeeDescriptionChange(key, "Custody"));
  act(() => result.current.onDateChange(new Date(2026, 5, 1)));
  act(() => result.current.onAccountChange("acc-z"));
  act(() => result.current.onGenerateChange(false));

  expect(result.current.fees[0]).toMatchObject({
    description: "Custody",
    kind: InvestmentFeeKind.OTHER,
  });
  expect(result.current.accountId).toBe("acc-z");
  expect(result.current.generate).toBe(false);

  act(() => result.current.onSave());
  expect(result.current.feeErrors).toEqual({});
  act(() => result.current.onFeeRemove(key));
  expect(result.current.fees).toHaveLength(0);
});

it("SHOULD require the description of an Other fee", () => {
  const { result } = setup();

  act(() => result.current.onQuantityChange("1"));
  act(() => result.current.onUnitPriceChange("1"));
  act(() => result.current.onAddFee());
  act(() =>
    result.current.onFeeKindChange(result.current.fees[0].key, "OTHER"),
  );
  act(() => result.current.onSave());

  expect(Object.keys(result.current.feeErrors)).toHaveLength(1);
  expect(createMutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD close and invalidate WHEN any write succeeds", () => {
  updateMutation.withStatus("success");

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD explain a negative position with the formatted date", () => {
  createMutation.withError(
    new InvestmentNegativePosition("2026-09-15") as never,
  );

  const { result } = setup();

  expect(result.current.failure).toEqual({
    key: "investment.errors.negativePosition",
    params: { date: "09/15/2026" },
  });
});

describe("editing", () => {
  beforeEach(() => {
    spies.params.mockReturnValue({ assetId: "asset-1", id: "op-1" });
  });

  it("SHOULD load the operation AND update with every field", () => {
    const { result } = setup();

    expect(result.current.isEditing).toBe(true);
    expect(result.current.quantity).toBe("500");
    expect(result.current.titleKey).toBe("investment.form.operation.editTitle");

    act(() => result.current.onQuantityChange("400"));
    act(() => result.current.onSave());

    expect(updateMutation.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "acc-1",
        id: "op-1",
        quantity: "400",
      }),
    );
  });

  it("SHOULD exclude the edited operation from the preview history", () => {
    detailQuery.withData(
      makeDetail({
        operations: [
          makeOperation({ id: "op-1", quantity: "500" }),
          makeOperation({ date: "2026-01-10", id: "op-2", quantity: "700" }),
        ],
      }),
    );
    const { result } = setup();

    act(() => result.current.onTypeChange("SELL"));
    act(() => result.current.onQuantityChange("1000"));

    expect(result.current.preview?.availableQuantity).toBe("700");
    expect(result.current.insufficient).toBe(true);
  });

  it("SHOULD delete after the confirmation", () => {
    const { result } = setup();

    act(() => result.current.onDeleteOpen());
    expect(result.current.deleteOpen).toBe(true);
    act(() => result.current.onDeleteCancel());
    expect(result.current.deleteOpen).toBe(false);

    act(() => result.current.onDeleteOpen());
    act(() => result.current.onDeleteConfirm());
    expect(deleteMutation.value.mutate).toHaveBeenCalledWith("op-1");
  });

  it("SHOULD be read-only WHEN the linked account is not reachable", () => {
    detailQuery.withData(
      makeDetail({
        operations: [makeOperation({ accountId: "gone", id: "op-1" })],
      }),
    );

    const { result } = setup();

    expect(result.current.readOnly).toBe(true);
    expect(result.current.readOnlyKey).toBe(
      "investment.form.operation.readOnlyAccount",
    );
    act(() => result.current.onSave());
    expect(updateMutation.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD be read-only WHEN the asset is archived", () => {
    detailQuery.withData(
      makeDetail({ status: InvestmentAssetStatus.ARCHIVED }),
    );

    const { result } = setup();

    expect(result.current.readOnlyKey).toBe("investment.errors.archived");
  });

  it("SHOULD report an unknown operation", () => {
    spies.params.mockReturnValue({ assetId: "asset-1", id: "ghost" });

    expect(setup().result.current.isNotFound).toBe(true);
  });

  it("SHOULD ask before discarding a dirty form", () => {
    const { result } = setup();

    act(() => result.current.onClose());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

    act(() => result.current.onQuantityChange("1"));
    act(() => result.current.onClose());
    expect(result.current.discardOpen).toBe(true);
    act(() => result.current.onDiscardCancel());
    act(() => result.current.onDiscardConfirm());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
  });
});

it("SHOULD be loading before the asset and the accounts arrive", () => {
  detailQuery.reset();

  expect(setup().result.current.isLoading).toBe(true);
});

it("SHOULD report a missing asset", () => {
  detailQuery.reset().withError();

  expect(setup().result.current.isNotFound).toBe(true);
});
