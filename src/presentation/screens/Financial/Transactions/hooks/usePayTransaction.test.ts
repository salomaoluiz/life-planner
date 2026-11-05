import { renderHook } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import {
  clearPayRequest,
  getPayRequest,
} from "@screens/Financial/ConfirmPayment/models/payRequest";

import TransactionUIModel from "../models/TransactionUIModel";
import usePayTransaction from "./usePayTransaction";

const mockOpenModal = jest.fn();

jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ openModal: mockOpenModal }),
}));

const dto = new TransactionDTO({
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
});

beforeEach(() => {
  jest.clearAllMocks();
  clearPayRequest();
});

it("SHOULD store the row AND open the confirm modal WHEN openFor is called", () => {
  const { result } = renderHook(() => usePayTransaction());

  result.current.openFor(new TransactionUIModel(dto));

  expect(getPayRequest()).toEqual({ item: dto });
  expect(mockOpenModal).toHaveBeenCalledWith("confirm_payment");
});

it("SHOULD keep the same openFor identity across renders", () => {
  const { rerender, result } = renderHook(() => usePayTransaction());
  const first = result.current.openFor;

  rerender({});

  expect(result.current.openFor).toBe(first);
});
