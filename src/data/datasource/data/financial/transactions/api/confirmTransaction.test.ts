import {
  ApiBusinessError,
  FieldInvalid,
  InvoiceIsPaid,
  TransactionNotProjected,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import confirmTransaction from "./confirmTransaction";

jest.mock("@infrastructure/api", () => ({ api: { post: jest.fn() } }));

const params = {
  date: new Date(2026, 9, 24).toISOString(),
  id: "tx-1",
  invoiceMonth: undefined as string | undefined,
  ownerId: "owner-1",
  value: "99,90",
};

async function capture(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD POST the real value in cents and the date to /confirm", async () => {
  await confirmTransaction(params);

  expect(api.post).toHaveBeenCalledWith(
    expect.stringMatching(
      /^\/v1\/finance\/transactions\/tx-1\/confirm\?today=\d{4}-\d{2}-\d{2}$/,
    ),
    { date: "2026-10-24", invoiceMonth: undefined, value: 9990 },
  );
});

it("SHOULD send the chosen invoice month", async () => {
  await confirmTransaction({ ...params, invoiceMonth: "2026-10" });

  expect(api.post).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ invoiceMonth: "2026-10" }),
  );
});

it("SHOULD throw FieldInvalid WITHOUT calling the API for a bad value", async () => {
  expect(
    await capture(confirmTransaction({ ...params, value: "abc" })),
  ).toBeInstanceOf(FieldInvalid);
  expect(api.post).not.toHaveBeenCalled();
});

it("SHOULD map 409 to TransactionNotProjected AND 422 Invoice is paid to InvoiceIsPaid", async () => {
  jest
    .mocked(api.post)
    .mockRejectedValueOnce(
      new ApiBusinessError("Transaction is not projected", 409),
    )
    .mockRejectedValueOnce(new ApiBusinessError("Invoice is paid", 422));

  expect(await capture(confirmTransaction(params))).toBeInstanceOf(
    TransactionNotProjected,
  );
  expect(await capture(confirmTransaction(params))).toBeInstanceOf(
    InvoiceIsPaid,
  );
});
