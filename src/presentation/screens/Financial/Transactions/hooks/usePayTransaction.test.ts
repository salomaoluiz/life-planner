import { act, renderHook } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { GenericError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import TransactionUIModel from "../models/TransactionUIModel";
import usePayTransaction from "./usePayTransaction";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    updateFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "update-transaction",
    },
  },
}));

const item = new TransactionUIModel(
  new TransactionDTO({
    accountId: "acc-1",
    category: "Bills",
    categoryId: "cat-1",
    date: new Date(2026, 9, 10).toISOString(),
    description: "Electricity",
    id: "tx-1",
    owner: "USER",
    ownerId: "user-id",
    paid: false,
    type: "EXPENSE",
    value: "189.90",
  }),
);

let mutation = new UseMutationFixture<unknown, unknown>();
const onPaid = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mutation = new UseMutationFixture<unknown, unknown>();
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

function setup() {
  return renderHook(() => usePayTransaction({ onPaid }));
}

it("SHOULD send only { paid: true } for the row AND track the paying row", () => {
  const { result } = setup();

  act(() => result.current.onPay(item));

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    id: "tx-1",
    ownerId: "user-id",
    paid: true,
  });
  expect(result.current.payingId).toBe("tx-1");
  expect(result.current.hasError).toBe(false);
});

it("SHOULD report the payment WHEN the mutation succeeds", () => {
  mutation.withStatus("success");
  const { result } = setup();

  expect(onPaid).toHaveBeenCalledTimes(1);
  expect(result.current.payingId).toBeUndefined();
});

it("SHOULD flag the error AND free the row WHEN the mutation fails", () => {
  mutation.withStatus("error").withError(new GenericError());
  const { result } = setup();

  expect(result.current.hasError).toBe(true);
  expect(result.current.payingId).toBeUndefined();
  expect(onPaid).not.toHaveBeenCalled();
});
