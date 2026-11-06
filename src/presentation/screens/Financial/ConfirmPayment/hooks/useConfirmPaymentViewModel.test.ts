import { act, renderHook } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { clearPayRequest, setPayRequest } from "../models/payRequest";
import submitPayment from "./submitPayment";
import useConfirmPaymentViewModel from "./useConfirmPaymentViewModel";

jest.mock("./submitPayment");
const mockCloseModal = jest.fn();

jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ closeModal: mockCloseModal }),
}));
const dateIso = new Date(2026, 9, 28).toISOString();

function row(type = "EXPENSE") {
  return new TransactionDTO({
    category: "Home",
    categoryId: "category-id",
    date: dateIso,
    description: "Conta de luz",
    id: "tx-1",
    owner: "USER",
    ownerId: "owner-id",
    paid: false,
    type,
    value: "184.20",
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  clearPayRequest();
});

it("SHOULD prefill the row value AND select the transaction date", () => {
  setPayRequest({ item: row() });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  expect(result.current.cents).toBe(18420);
  expect(result.current.choice).toBe("transaction");
  expect(result.current.isReady).toBe(true);
  expect(result.current.differenceCents).toBe(0);
});

it("SHOULD start from the draft WHEN the request carries one", () => {
  setPayRequest({
    draft: { cents: 19175, choice: "today" },
    item: row(),
  });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  expect(result.current.cents).toBe(19175);
  expect(result.current.choice).toBe("today");
  expect(result.current.differenceCents).toBe(755);
});

it("SHOULD NOT submit WHEN the value is zero AND show the error", () => {
  setPayRequest({ item: row() });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  act(() => result.current.onCentsChange(0));
  expect(result.current.isValid).toBe(false);
  act(() => result.current.onConfirm());

  expect(submitPayment).not.toHaveBeenCalled();
  expect(result.current.amountError).toBe(
    "financial.transactions.confirmPay.amountError",
  );
  expect(mockCloseModal).not.toHaveBeenCalled();
});

it("SHOULD submit once with the kept date AND close, ignoring a second tap", () => {
  const item = row();

  setPayRequest({ item });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  act(() => result.current.onCentsChange(19175));
  act(() => result.current.onConfirm());
  act(() => result.current.onConfirm());

  expect(submitPayment).toHaveBeenCalledTimes(1);
  expect(submitPayment).toHaveBeenCalledWith(item, {
    cents: 19175,
    choice: "transaction",
    dateIso,
    other: undefined,
  });
  expect(mockCloseModal).toHaveBeenCalledTimes(1);
});

it("SHOULD send the picked date WHEN Other date is chosen", () => {
  setPayRequest({ item: row() });
  const { result } = renderHook(() => useConfirmPaymentViewModel());
  const picked = new Date(2026, 10, 1);

  act(() => result.current.onChoice("other"));
  act(() => result.current.onOtherDate(picked));
  act(() => result.current.onConfirm());

  expect(jest.mocked(submitPayment).mock.calls[0][1]).toMatchObject({
    choice: "other",
    dateIso: picked.toISOString(),
  });
});

it("SHOULD close WHEN there is no request (page reloaded on the modal)", () => {
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  expect(result.current.isReady).toBe(false);
  expect(mockCloseModal).toHaveBeenCalledTimes(1);
  act(() => result.current.onConfirm());
  expect(submitPayment).not.toHaveBeenCalled();
});

it("SHOULD clear the request AND close on cancel", () => {
  setPayRequest({ item: row() });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  act(() => result.current.onClose());
  expect(mockCloseModal).toHaveBeenCalledTimes(1);
});

it("SHOULD flag an income AND an overdue row", () => {
  setPayRequest({ item: row("INCOME") });
  const { result } = renderHook(() => useConfirmPaymentViewModel());

  expect(result.current.isIncome).toBe(true);
  expect(result.current.overdueDays).toBeGreaterThan(0);
});
