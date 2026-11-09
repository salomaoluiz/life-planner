import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import queryName from "@tests/queryName";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";
import TransferEntity from "@domain/entities/financial/TransferEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";

import useTransferFormViewModel from "./useTransferFormViewModel";

const mockCloseModal = jest.fn();

jest.mock("@screens/Financial/Transactions/pending/writeCache");
jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ closeModal: mockCloseModal }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createFinancialTransferUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteFinancialTransferUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialTransferUseCase: { execute: jest.fn(), uniqueName: "transfer" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
    updateFinancialTransferUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

function account(
  id: string,
  currency: string,
  ownerId = "user-id",
  extra = {},
) {
  return new AccountDTO({
    balance: 0,
    currency,
    icon: "bank",
    id,
    name: id,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    status: "ACTIVE",
    ...extra,
  } as never);
}

const accounts = [
  account("brl-checking", "BRL", "user-id", { isFavorite: true }),
  account("brl-savings", "BRL"),
  account("usd-family", "USD", "family-1"),
  account("brl-old", "BRL", "user-id", { status: "ARCHIVED" }),
];
const stored = new TransferEntity({
  amountIn: "920.00",
  amountOut: "5000.00",
  currencyIn: "USD",
  currencyOut: "BRL",
  dateIn: new Date(2026, 10, 6).toISOString(),
  dateOut: new Date(2026, 10, 4).toISOString(),
  description: "Send",
  fromAccountId: "brl-checking",
  id: "transfer-1",
  paid: true,
  toAccountId: "usd-family",
});
// endregion mocks

const fixtures: Record<string, unknown> = {};

function useFixtures(extra: Record<string, unknown> = {}) {
  Object.keys(fixtures).forEach((key) => delete fixtures[key]);
  Object.assign(fixtures, {
    accounts: new UseQueryFixture().withData(accounts).build(),
    owners: new UseQueryFixture().withData(owners).build(),
    ...extra,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  jest
    .mocked(useQuery)
    .mockImplementation(
      ((props: { cacheKey: string[] }) =>
        fixtures[queryName(props.cacheKey)] ??
        new UseQueryFixture().build()) as never,
    );
  jest.mocked(invalidateAfterWrite).mockResolvedValue(undefined);
  useFixtures();
});

function typeAll(result: {
  current: ReturnType<typeof useTransferFormViewModel>;
}) {
  act(() => {
    result.current.onDescriptionChange("Savings");
    result.current.onFromAccountChange("brl-checking");
    result.current.onToAccountChange("brl-savings");
    result.current.onAmountOutChange(100000);
  });
}

describe("new transfer", () => {
  it("SHOULD start with the favorite account as the origin AND list only active accounts grouped by owner", () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    expect(result.current.fromAccountId).toBe("brl-checking");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.canSaveAndNew).toBe(true);
    expect(result.current.accountOptions.map((option) => option.value)).toEqual(
      ["brl-checking", "brl-savings", "usd-family"],
    );
    expect(result.current.accountOptions[2]).toMatchObject({
      currency: "USD",
      description: "Family",
      label: "usd-family · USD",
    });
  });

  it("SHOULD not save AND show the errors WHEN the form is empty", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    await act(async () => result.current.onSave());

    expect(
      useCases.createFinancialTransferUseCase.execute,
    ).not.toHaveBeenCalled();
    expect(result.current.errors).toMatchObject({
      amountOut: "financial.transfers.form.errors.amount",
      description: "financial.transfers.form.errors.description",
    });
  });

  it("SHOULD create the transfer, mark the lists stale AND close the modal", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    typeAll(result);
    await act(async () => result.current.onSave());

    expect(
      useCases.createFinancialTransferUseCase.execute,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amountOut: "1000.00",
        description: "Savings",
        fromAccountId: "brl-checking",
        paid: true,
        toAccountId: "brl-savings",
      }),
    );
    expect(invalidateAfterWrite).toHaveBeenCalledWith(
      { invoiceMonths: "all", listMonths: "all", projections: true },
      { refetch: false },
    );
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("SHOULD keep both accounts AND show the saved notice WHEN saving and creating another", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    typeAll(result);
    await act(async () => result.current.onSaveAndNew());

    expect(mockCloseModal).not.toHaveBeenCalled();
    expect(result.current.isSaved).toBe(true);
    expect(result.current.fromAccountId).toBe("brl-checking");
    expect(result.current.toAccountId).toBe("brl-savings");
    expect(result.current.state?.description).toBe("");
    act(() => result.current.onSavedHide());
    expect(result.current.isSaved).toBe(false);
  });

  it("SHOULD show the mapped error AND stay open WHEN the API refuses", async () => {
    jest
      .mocked(useCases.createFinancialTransferUseCase.execute)
      .mockRejectedValueOnce(new BusinessError());
    const { result } = renderHook(() => useTransferFormViewModel());

    typeAll(result);
    await act(async () => result.current.onSave());

    expect(result.current.errorKey).toBe("common.errors.generic");
    expect(result.current.isBlocking).toBe(false);
    expect(mockCloseModal).not.toHaveBeenCalled();
  });

  it("SHOULD require the amount in for different currencies AND compute it from a typed rate", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    act(() => {
      result.current.onDescriptionChange("USD");
      result.current.onToAccountChange("usd-family");
      result.current.onAmountOutChange(500000);
    });
    expect(result.current.currencyIn).toBe("USD");
    await act(async () => result.current.onSave());
    expect(result.current.errors.amountIn).toBe(
      "financial.transfers.form.errors.amountIn",
    );

    act(() => result.current.onRateChange("5,4348"));
    expect(result.current.amountInCents).toBe(92000);
    expect(result.current.rate).toEqual({ base: "IN", value: 5.4348 });

    act(() => result.current.onAmountInChange(92000));
    expect(result.current.state?.rateMode).toBe("AMOUNT_IN");
    act(() => result.current.onRateModeChange("RATE"));
    expect(result.current.state?.rateMode).toBe("RATE");
    act(() => result.current.onRateModeChange("AMOUNT_IN"));
    expect(result.current.state?.amountInCents).toBe(92000);
  });

  it("SHOULD swap the accounts, move the dates AND the rest of the fields", () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    act(() => {
      result.current.onToAccountChange("brl-savings");
      result.current.onAccountSwap();
      result.current.onDateOutChange(new Date(2026, 11, 1));
      result.current.onDateInChange(new Date(2026, 11, 3));
      result.current.onFeeChange(350);
      result.current.onPaidChange(false);
      result.current.onNotesChange("note");
      result.current.onRepeatToggle(true);
      result.current.onRepeatFrequencyChange("WEEKLY");
      result.current.onRepeatEndChange(new Date(2027, 0, 1));
    });

    expect(result.current.fromAccountId).toBe("brl-savings");
    expect(result.current.toAccountId).toBe("brl-checking");
    expect(result.current.daysLater).toBe(2);
    act(() => result.current.onSameDate());
    expect(result.current.daysLater).toBe(0);
    expect(result.current.state).toMatchObject({
      feeCents: 350,
      notes: "note",
      paid: false,
      repeatFrequency: "WEEKLY",
      repeatOn: true,
    });
  });

  it("SHOULD ask before discarding a changed form AND close at once WHEN nothing changed", () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    act(() => result.current.onClose());
    expect(mockCloseModal).toHaveBeenCalledTimes(1);

    act(() => result.current.onDescriptionChange("x"));
    act(() => result.current.onClose());
    expect(result.current.isDiscardDialogOpen).toBe(true);
    act(() => result.current.onDiscardCancel());
    expect(result.current.isDiscardDialogOpen).toBe(false);
    act(() => result.current.onDiscardConfirm());
    expect(mockCloseModal).toHaveBeenCalledTimes(2);
  });
});

describe("edit transfer", () => {
  beforeEach(() => {
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ transferId: "transfer-1" });
    useFixtures({
      transfers: new UseQueryFixture()
        .withData({ rows: [], transfer: stored } as never)
        .build(),
    });
  });

  it("SHOULD load the stored transfer AND send only what changed", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.canSaveAndNew).toBe(false);
    expect(result.current.state?.description).toBe("Send");

    act(() => result.current.onDescriptionChange("New"));
    await act(async () => result.current.onSave());

    expect(
      useCases.updateFinancialTransferUseCase.execute,
    ).toHaveBeenCalledWith({
      description: "New",
      id: "transfer-1",
      scope: undefined,
    });
  });

  it("SHOULD ask the scope of a series occurrence AND pass it on save and delete", async () => {
    useFixtures({
      transfers: new UseQueryFixture()
        .withData({
          rows: [],
          transfer: new TransferEntity({ ...stored, recurrenceId: "series-1" }),
        } as never)
        .build(),
    });
    const { result } = renderHook(() => useTransferFormViewModel());

    expect(result.current.isRecurring).toBe(true);
    act(() => result.current.onScopeChange("THIS_AND_NEXT"));
    act(() => result.current.onNotesChange("n"));
    await act(async () => result.current.onSave());
    await act(async () => {
      result.current.onDeletePress();
      await result.current.onDeleteConfirm();
    });

    expect(
      useCases.updateFinancialTransferUseCase.execute,
    ).toHaveBeenCalledWith(expect.objectContaining({ scope: "THIS_AND_NEXT" }));
    expect(
      useCases.deleteFinancialTransferUseCase.execute,
    ).toHaveBeenCalledWith({
      id: "transfer-1",
      scope: "THIS_AND_NEXT",
    });
  });

  it("SHOULD delete after the confirmation AND close", async () => {
    const { result } = renderHook(() => useTransferFormViewModel());

    act(() => result.current.onDeletePress());
    expect(result.current.isDeleteDialogOpen).toBe(true);
    act(() => result.current.onDeleteCancel());
    expect(result.current.isDeleteDialogOpen).toBe(false);
    await act(async () => result.current.onDeleteConfirm());

    expect(
      useCases.deleteFinancialTransferUseCase.execute,
    ).toHaveBeenCalledWith({
      id: "transfer-1",
      scope: undefined,
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("SHOULD show an error WHEN the delete fails", async () => {
    jest
      .mocked(useCases.deleteFinancialTransferUseCase.execute)
      .mockRejectedValueOnce(new BusinessError());
    const { result } = renderHook(() => useTransferFormViewModel());

    await act(async () => result.current.onDeleteConfirm());

    expect(result.current.errorKey).toBe("common.errors.generic");
  });

  it("SHOULD flag not found WHEN the transfer cannot be read", () => {
    useFixtures({ transfers: new UseQueryFixture().withError().build() });
    const { result } = renderHook(() => useTransferFormViewModel());

    expect(result.current.isNotFound).toBe(true);
  });
});
