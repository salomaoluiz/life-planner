import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { useCases } from "@application/useCases";
import { openConfirmPaymentModal } from "@screens/Financial/Transactions/pending/openTransactionModal";
import runPendingChange from "@screens/Financial/Transactions/pending/runPendingChange";

import { clearPayRequest, getPayRequest } from "../models/payRequest";
import submitPayment from "./submitPayment";

jest.mock("@screens/Financial/Transactions/pending/runPendingChange");
jest.mock(
  "@screens/Financial/Transactions/pending/openTransactionModal",
  () => ({
    __esModule: true,
    default: jest.fn(),
    openConfirmPaymentModal: jest.fn(),
  }),
);
jest.mock("@application/useCases", () => ({
  useCases: {
    updateFinancialTransactionUseCase: { execute: jest.fn() },
  },
}));

const run = runPendingChange as jest.Mock;
const dateIso = new Date(2026, 9, 28).toISOString();

function item(type = "EXPENSE") {
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

it("SHOULD queue an edit of the paid row WITH the pay action for an expense", async () => {
  const row = item();

  submitPayment(row, { cents: 19175, choice: "transaction", dateIso });

  const [change, execute] = run.mock.calls[0];

  expect(change).toMatchObject({
    action: "pay",
    description: "Conta de luz",
    kind: "edit",
    previous: row,
    row: { date: dateIso, paid: true, value: "191.75" },
  });
  await execute();
  expect(
    useCases.updateFinancialTransactionUseCase.execute,
  ).toHaveBeenCalledWith({
    date: dateIso,
    id: "tx-1",
    ownerId: "owner-id",
    paid: true,
    scope: undefined,
    value: "191.75",
  });
});

it("SHOULD use the receive action for an income", () => {
  submitPayment(item("INCOME"), { cents: 18420, choice: "today", dateIso });

  expect(run.mock.calls[0][0].action).toBe("receive");
});

it("SHOULD reopen the modal WITH the chosen draft WHEN retry runs", () => {
  const row = item();
  const other = new Date(2026, 10, 1);

  submitPayment(row, { cents: 19175, choice: "other", dateIso, other });
  const retry = run.mock.calls[0][2];

  retry();

  expect(getPayRequest()).toEqual({
    draft: { cents: 19175, choice: "other", other },
    item: row,
  });
  expect(openConfirmPaymentModal).toHaveBeenCalledTimes(1);
});
