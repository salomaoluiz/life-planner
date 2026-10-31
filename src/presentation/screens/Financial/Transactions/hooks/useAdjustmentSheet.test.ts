import { act, renderHook } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";

import TransactionUIModel from "../models/TransactionUIModel";
import runPendingChange from "../pending/runPendingChange";
import useAdjustmentSheet from "./useAdjustmentSheet";

jest.mock("../pending/runPendingChange");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFinancialTransactionUseCase: {
      execute: jest.fn().mockResolvedValue(undefined),
      uniqueName: "delete-transaction",
    },
  },
}));

const item = new TransactionUIModel(
  new TransactionDTO({
    accountId: "acc-1",
    accountName: "Checking",
    category: "Balance adjustment",
    categoryId: "cat-1",
    date: new Date(2026, 9, 15).toISOString(),
    description: "Balance adjustment",
    excludeFromTotals: true,
    id: "adj-1",
    owner: "USER",
    ownerId: "user-id",
    systemKey: "BALANCE_ADJUSTMENT",
    type: "INCOME",
    value: "50.00",
  }),
);

const runSpy = jest.mocked(runPendingChange);

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return renderHook(() => useAdjustmentSheet());
}

it("SHOULD be closed until an adjustment is opened, then close again", () => {
  const { result } = setup();
  expect(result.current.item).toBeUndefined();

  act(() => result.current.onOpen(item));
  expect(result.current.item).toBe(item);

  act(() => result.current.onClose());
  expect(result.current.item).toBeUndefined();
});

it("SHOULD close the sheet at once and register a pending delete of the adjustment", async () => {
  const { result } = setup();

  act(() => result.current.onOpen(item));
  act(() => result.current.onDelete());

  expect(result.current.item).toBeUndefined();
  expect(runSpy).toHaveBeenCalledTimes(1);
  const [change, execute] = runSpy.mock.calls[0];

  expect(change).toMatchObject({
    kind: "delete",
    target: { transactionId: "adj-1" },
  });
  await execute();
  expect(
    jest.requireMock("@application/useCases").useCases
      .deleteFinancialTransactionUseCase.execute,
  ).toHaveBeenCalledWith({ id: "adj-1", ownerId: "user-id" });
});

it("SHOULD send the delete again WHEN Try again is pressed", () => {
  const { result } = setup();

  act(() => result.current.onOpen(item));
  act(() => result.current.onDelete());
  runSpy.mock.calls[0][2]();

  expect(runSpy).toHaveBeenCalledTimes(2);
});

it("SHOULD do nothing WHEN deleting with no opened adjustment", () => {
  const { result } = setup();

  act(() => result.current.onDelete());

  expect(runSpy).not.toHaveBeenCalled();
});
