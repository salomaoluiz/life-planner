import { act, renderHook } from "@tests";
import queryName from "@tests/queryName";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";
import TransferEntity from "@domain/entities/financial/TransferEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import {
  clearPayRequest,
  setPayRequest,
} from "@screens/Financial/ConfirmPayment/models/payRequest";
import { invalidateAfterWrite } from "@screens/Financial/Transactions/pending/writeCache";

import useConfirmTransferViewModel from "./useConfirmTransferViewModel";

const mockCloseModal = jest.fn();

jest.mock("@screens/Financial/Transactions/pending/writeCache");
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ closeModal: mockCloseModal }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialTransferUseCase: { execute: jest.fn(), uniqueName: "transfer" },
    updateFinancialTransferUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

const row = new TransactionDTO({
  accountId: "acc-1",
  category: "Transfer out",
  categoryId: "cat-out",
  date: new Date(2026, 10, 30).toISOString(),
  description: "Monthly",
  id: "row-out",
  owner: "USER",
  ownerId: "user-id",
  paid: false,
  systemKey: "TRANSFER_OUT",
  transferId: "transfer-1",
  type: "EXPENSE",
  value: "1000.00",
});

function given(entity: TransferEntity) {
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      queryName(props.cacheKey) === "transfers"
        ? new UseQueryFixture()
            .withData({ rows: [], transfer: entity } as never)
            .build()
        : new UseQueryFixture().build()) as never);
}

function transfer(overrides = {}) {
  return new TransferEntity({
    amountOut: "1000.00",
    currencyIn: "USD",
    currencyOut: "BRL",
    dateIn: new Date(2026, 10, 30).toISOString(),
    dateOut: new Date(2026, 10, 30).toISOString(),
    description: "Monthly",
    id: "transfer-1",
    paid: false,
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  clearPayRequest();
  setPayRequest({ item: row });
  jest.mocked(invalidateAfterWrite).mockResolvedValue(undefined);
  given(transfer());
});

it("SHOULD close at once WHEN there is no request to confirm", () => {
  clearPayRequest();

  renderHook(() => useConfirmTransferViewModel());

  expect(mockCloseModal).toHaveBeenCalled();
});

it("SHOULD keep the confirmation disabled until the amount in is typed, then pay with it", async () => {
  const { result } = renderHook(() => useConfirmTransferViewModel());

  expect(result.current.sameCurrency).toBe(false);
  expect(result.current.canConfirm).toBe(false);
  await act(async () => result.current.onConfirm());
  expect(
    useCases.updateFinancialTransferUseCase.execute,
  ).not.toHaveBeenCalled();

  act(() => result.current.onAmountInChange(18000));
  expect(result.current.canConfirm).toBe(true);
  await act(async () => result.current.onConfirm());

  expect(useCases.updateFinancialTransferUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      amountIn: "180.00",
      id: "transfer-1",
      paid: true,
    }),
  );
  expect(invalidateAfterWrite).toHaveBeenCalled();
  expect(mockCloseModal).toHaveBeenCalled();
});

it("SHOULD take the amount in from a typed rate AND show the derived rate", () => {
  const { result } = renderHook(() => useConfirmTransferViewModel());

  act(() => result.current.onRateChange("5,5556"));

  expect(result.current.amountInCents).toBe(18000);
  expect(result.current.rate).toEqual({ base: "IN", value: 5.5556 });
  expect(result.current.canConfirm).toBe(true);
});

it("SHOULD confirm the same currency at once AND keep the amount out fixed for a series occurrence", async () => {
  given(transfer({ currencyIn: "BRL", recurrenceId: "series-1" }));
  const { result } = renderHook(() => useConfirmTransferViewModel());

  expect(result.current.isAmountOutFixed).toBe(true);
  expect(result.current.canConfirm).toBe(true);
  await act(async () => result.current.onConfirm());

  expect(useCases.updateFinancialTransferUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({ paid: true, scope: "ONLY_THIS" }),
  );
});

it("SHOULD send the changed amount out AND the new days", async () => {
  given(transfer({ currencyIn: "BRL" }));
  const { result } = renderHook(() => useConfirmTransferViewModel());

  act(() => {
    result.current.onAmountOutChange(90000);
    result.current.onDateOutChange(new Date(2026, 11, 1));
    result.current.onDateInChange(new Date(2026, 11, 2));
    result.current.onDateInChange(undefined);
  });
  await act(async () => result.current.onConfirm());

  expect(useCases.updateFinancialTransferUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      amountOut: "900.00",
      dateIn: new Date(2026, 11, 2).toISOString(),
      dateOut: new Date(2026, 11, 1).toISOString(),
    }),
  );
});

it("SHOULD show the mapped error AND stay open WHEN the API refuses", async () => {
  given(transfer({ currencyIn: "BRL" }));
  jest
    .mocked(useCases.updateFinancialTransferUseCase.execute)
    .mockRejectedValueOnce(new BusinessError());
  const { result } = renderHook(() => useConfirmTransferViewModel());

  await act(async () => result.current.onConfirm());

  expect(result.current.errorKey).toBe("common.errors.generic");
  expect(result.current.isBlocking).toBe(false);
  expect(mockCloseModal).not.toHaveBeenCalled();
  act(() => result.current.onAmountOutChange(100));
  expect(result.current.errorKey).toBeUndefined();
});

it("SHOULD clear the request AND close WHEN cancelled, but not while saving", () => {
  const { result } = renderHook(() => useConfirmTransferViewModel());

  act(() => result.current.onClose());

  expect(mockCloseModal).toHaveBeenCalledTimes(1);
});
