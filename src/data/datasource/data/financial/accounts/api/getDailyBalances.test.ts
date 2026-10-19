import DailyBalanceModel from "@data/models/financial/DailyBalanceModel";
import {
  ApiBusinessError,
  ConnectivityError,
  FieldInvalid,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import getDailyBalances from "./getDailyBalances";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const payload = {
  accounts: [],
  days: [],
  month: "2026-11",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 15, 12, 0, 0) });
});
afterEach(() => jest.useRealTimers());

it("SHOULD GET the daily balances with the month, repeated owners and today", async () => {
  jest.mocked(api.get).mockResolvedValueOnce(payload);

  const result = await getDailyBalances({
    month: "2026-11",
    ownerIds: ["o1", "o2"],
  });

  expect(api.get).toHaveBeenCalledWith(
    "/v1/finance/accounts/daily-balances?month=2026-11&today=2026-10-15&ownerId=o1&ownerId=o2",
  );
  expect(result).toEqual(DailyBalanceModel.fromJSON(payload));
});

it("SHOULD map a 400 to FieldInvalid AND re-throw connectivity errors", async () => {
  jest
    .mocked(api.get)
    .mockRejectedValueOnce(new ApiBusinessError("Month is too far ahead", 400));

  await expect(
    getDailyBalances({ month: "2028-11", ownerIds: ["o1"] }),
  ).rejects.toBeInstanceOf(FieldInvalid);

  const error = new ConnectivityError();
  jest.mocked(api.get).mockRejectedValueOnce(error);

  await expect(
    getDailyBalances({ month: "2026-11", ownerIds: ["o1"] }),
  ).rejects.toBe(error);
});
