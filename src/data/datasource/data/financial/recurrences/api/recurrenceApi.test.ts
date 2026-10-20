import {
  apiProjected,
  apiRecurrence,
  apiRecurringTransaction,
} from "@data/models/financial/mocks/Recurrence.mocks";
import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
  RecurrenceHasPaidOccurrences,
  RecurrencePaidAfterEnd,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createRecurrence from "./createRecurrence";
import deleteOccurrence from "./deleteOccurrence";
import deleteRecurrence from "./deleteRecurrence";
import getProjections from "./getProjections";
import getRecurrences from "./getRecurrences";
import materializeOccurrence from "./materializeOccurrence";
import splitRecurrence from "./splitRecurrence";
import updateRecurrence from "./updateRecurrence";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

async function capture(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 17, 12) });
});
afterEach(() => jest.useRealTimers());

const createParams = {
  accountId: "account-1",
  categoryId: "category-1",
  date: new Date(2026, 9, 5).toISOString(),
  description: "Rent",
  endDate: new Date(2027, 8, 5).toISOString(),
  frequency: "MONTHLY" as const,
  owner: "USER" as const,
  ownerId: "user-id",
  paid: true,
  type: "EXPENSE" as const,
  value: "2000.00",
};

describe("createRecurrence", () => {
  it("SHOULD POST the cents, the calendar dates AND the local today, then map the series and its rows", async () => {
    jest.mocked(api.post).mockResolvedValueOnce({
      occurrences: [apiRecurringTransaction],
      overLimit: false,
      recurrence: apiRecurrence,
    });

    const result = await createRecurrence(createParams);

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/recurrences?today=2026-10-17",
      {
        accountId: "account-1",
        categoryId: "category-1",
        creditCardId: undefined,
        date: "2026-10-05",
        description: "Rent",
        endDate: "2027-09-05",
        frequency: "MONTHLY",
        owner: "USER",
        ownerId: "user-id",
        paid: true,
        type: "EXPENSE",
        value: 200000,
      },
    );
    expect(result.recurrence.id).toBe("recurrence-1");
    expect(result.occurrences[0].recurrenceId).toBe("recurrence-1");
    expect(result.overLimit).toBe(false);
  });

  it("SHOULD omit the end date WHEN there is none", async () => {
    jest.mocked(api.post).mockResolvedValueOnce({
      occurrences: [],
      overLimit: true,
      recurrence: apiRecurrence,
    });

    const result = await createRecurrence({
      ...createParams,
      endDate: undefined,
    });

    expect(jest.mocked(api.post).mock.calls[0][1]).toMatchObject({
      endDate: undefined,
    });
    expect(result.overLimit).toBe(true);
  });

  it("SHOULD fail with FieldInvalid BEFORE the network WHEN the value is not money", async () => {
    expect(
      await capture(createRecurrence({ ...createParams, value: "abc" })),
    ).toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("SHOULD map 400/422 AND unknown errors", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("x", 400));
    expect(await capture(createRecurrence(createParams))).toBeInstanceOf(
      FieldInvalid,
    );

    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));
    expect(await capture(createRecurrence(createParams))).toBeInstanceOf(
      GenericError,
    );
  });
});

describe("deleteOccurrence / deleteRecurrence", () => {
  it("SHOULD DELETE an occurrence by scope with the confirmation", async () => {
    await deleteOccurrence({
      confirmPaid: true,
      occurrenceNumber: 4,
      recurrenceId: "recurrence-1",
      scope: "THIS_AND_NEXT",
    });

    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1/occurrences/4?scope=THIS_AND_NEXT&today=2026-10-17&confirmPaid=true",
    );
  });

  it("SHOULD DELETE an occurrence without the confirmation by default", async () => {
    await deleteOccurrence({
      occurrenceNumber: 4,
      recurrenceId: "recurrence-1",
      scope: "ONLY_THIS",
    });

    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1/occurrences/4?scope=ONLY_THIS&today=2026-10-17",
    );
  });

  it("SHOULD turn the 409 counts of an occurrence delete into RecurrenceHasPaidOccurrences", async () => {
    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(
        new ApiBusinessError("Paid occurrences", 409, { paidCount: 2 }),
      );

    const error = await capture(
      deleteOccurrence({
        occurrenceNumber: 4,
        recurrenceId: "recurrence-1",
        scope: "THIS_AND_NEXT",
      }),
    );

    expect(error).toBeInstanceOf(RecurrenceHasPaidOccurrences);
    expect(error).toMatchObject({
      detachedCount: 0,
      paidCount: 2,
      paidTotal: 0,
    });
  });

  it("SHOULD DELETE the series AND return the counts", async () => {
    jest.mocked(api.delete).mockResolvedValueOnce({ deleted: 3, detached: 1 });

    expect(
      await deleteRecurrence({ confirmPaid: true, id: "recurrence-1" }),
    ).toEqual({ deleted: 3, detached: 1 });
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1?confirmPaid=true",
    );

    jest.mocked(api.delete).mockResolvedValueOnce({ deleted: 0, detached: 0 });
    await deleteRecurrence({ id: "recurrence-1" });
    expect(api.delete).toHaveBeenLastCalledWith(
      "/v1/finance/recurrences/recurrence-1",
    );
  });

  it("SHOULD turn the 409 of the series delete into RecurrenceHasPaidOccurrences WITH the counts", async () => {
    jest.mocked(api.delete).mockRejectedValueOnce(
      new ApiBusinessError("Paid occurrences", 409, {
        detachedCount: 1,
        paidCount: 3,
        paidTotal: 600000,
      }),
    );

    expect(
      await capture(deleteRecurrence({ id: "recurrence-1" })),
    ).toMatchObject({ detachedCount: 1, paidCount: 3, paidTotal: 600000 });

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Paid occurrences", 409));
    expect(
      await capture(deleteRecurrence({ id: "recurrence-1" })),
    ).toMatchObject({ paidCount: 0 });

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("nf", 404));
    expect(
      await capture(deleteRecurrence({ id: "recurrence-1" })),
    ).toBeInstanceOf(FinancialNotFound);
  });
});

describe("reads", () => {
  it("SHOULD GET the projections of the owners in the range with the local today", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiProjected]);

    const result = await getProjections({
      from: "2026-11",
      ownerIds: ["user-id", "family-id"],
      to: "2027-01",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/recurrences/projections?from=2026-11&to=2027-01&today=2026-10-17&ownerId=user-id&ownerId=family-id",
    );
    expect(result[0].occurrenceNumber).toBe(2);
  });

  it("SHOULD send only the filters projections understand (spec 045)", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiProjected]);

    await getProjections({
      filter: {
        accountIds: ["a1"],
        categoryIds: ["c1"],
        from: "2025-01-01",
        paid: false,
        q: "gym",
        tagIds: ["t1"],
        to: "2025-02-28",
      },
      from: "2026-11",
      ownerIds: ["user-id"],
      to: "2027-01",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/recurrences/projections?from=2026-11&to=2027-01&today=2026-10-17&ownerId=user-id&accountId=a1&categoryId=c1&tagId=t1&q=gym",
    );
  });

  it("SHOULD NOT call the API WITHOUT owners", async () => {
    expect(
      await getProjections({ from: "2026-11", ownerIds: [], to: "2026-11" }),
    ).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("SHOULD map a projections failure to GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    expect(
      await capture(
        getProjections({ from: "2026-11", ownerIds: ["u"], to: "2026-11" }),
      ),
    ).toBeInstanceOf(GenericError);
  });

  it("SHOULD GET the series with the filter", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiRecurrence]);

    const result = await getRecurrences({
      accountId: "account-1",
      ownerIds: ["user-id"],
      status: "ACTIVE",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/recurrences?accountId=account-1&status=ACTIVE&ownerId=user-id",
    );
    expect(result[0].id).toBe("recurrence-1");
  });

  it("SHOULD GET every series WITHOUT a filter AND map failures", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([]);
    await getRecurrences({ creditCardId: undefined });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/recurrences");

    jest.mocked(api.get).mockResolvedValueOnce([]);
    await getRecurrences({ creditCardId: "card-1" });
    expect(api.get).toHaveBeenLastCalledWith(
      "/v1/finance/recurrences?creditCardId=card-1",
    );

    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));
    expect(await capture(getRecurrences({}))).toBeInstanceOf(GenericError);
  });
});

describe("writes", () => {
  it("SHOULD POST the edits of a projected occurrence with scope ONLY_THIS", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiRecurringTransaction);

    const result = await materializeOccurrence({
      date: new Date(2026, 10, 10).toISOString(),
      description: "Rent Nov",
      occurrenceNumber: 2,
      paid: false,
      recurrenceId: "recurrence-1",
      value: "2100.00",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1/occurrences/2?today=2026-10-17",
      {
        categoryId: undefined,
        date: "2026-11-10",
        description: "Rent Nov",
        paid: false,
        scope: "ONLY_THIS",
        value: 210000,
      },
    );
    expect(result.id).toBe("transaction-1");
  });

  it("SHOULD map materialize failures AND send no date/value WHEN absent", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiRecurringTransaction);
    await materializeOccurrence({ occurrenceNumber: 2, recurrenceId: "r" });
    expect(jest.mocked(api.post).mock.calls[0][1]).toMatchObject({
      date: undefined,
      value: undefined,
    });

    jest.mocked(api.post).mockRejectedValueOnce(new ApiBusinessError("c", 409));
    expect(
      await capture(
        materializeOccurrence({ occurrenceNumber: 2, recurrenceId: "r" }),
      ),
    ).toBeInstanceOf(GenericError);
  });

  it("SHOULD POST the split with the end date as a calendar day, null or omitted", async () => {
    jest.mocked(api.post).mockResolvedValue({
      ended: apiRecurrence,
      occurrences: [apiRecurringTransaction],
      recurrence: apiRecurrence,
    });

    const result = await splitRecurrence({
      endDate: new Date(2027, 11, 5).toISOString(),
      frequency: "WEEKLY",
      occurrenceNumber: 5,
      recurrenceId: "recurrence-1",
      value: "2200.00",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1/split?today=2026-10-17",
      expect.objectContaining({
        endDate: "2027-12-05",
        frequency: "WEEKLY",
        occurrenceNumber: 5,
        value: 220000,
      }),
    );
    expect(result.ended?.id).toBe("recurrence-1");

    await splitRecurrence({
      endDate: null,
      occurrenceNumber: 5,
      recurrenceId: "recurrence-1",
    });
    expect(jest.mocked(api.post).mock.calls[1][1]).toMatchObject({
      endDate: null,
    });

    jest.mocked(api.post).mockResolvedValueOnce({
      occurrences: [],
      recurrence: apiRecurrence,
    });
    expect(
      (await splitRecurrence({ occurrenceNumber: 1, recurrenceId: "r" })).ended,
    ).toBeUndefined();
  });

  it("SHOULD map the split 422 AND unknown errors", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError(
          "Occurrences after the new end date are paid",
          422,
        ),
      );
    expect(
      await capture(
        splitRecurrence({ occurrenceNumber: 1, recurrenceId: "r" }),
      ),
    ).toBeInstanceOf(RecurrencePaidAfterEnd);
  });

  it("SHOULD PATCH only the sent fields of the series", async () => {
    jest.mocked(api.patch).mockResolvedValueOnce(apiRecurrence);

    const result = await updateRecurrence({
      endDate: null,
      id: "recurrence-1",
      value: "2100.00",
    });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/finance/recurrences/recurrence-1?today=2026-10-17",
      {
        categoryId: undefined,
        description: undefined,
        endDate: null,
        value: 210000,
      },
    );
    expect(result.id).toBe("recurrence-1");

    jest.mocked(api.patch).mockResolvedValueOnce(apiRecurrence);
    await updateRecurrence({
      endDate: new Date(2027, 11, 5).toISOString(),
      id: "recurrence-1",
    });
    expect(jest.mocked(api.patch).mock.calls[1][1]).toMatchObject({
      endDate: "2027-12-05",
    });

    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(new ApiBusinessError("x", 404));
    expect(
      await capture(updateRecurrence({ id: "r", value: "1" })),
    ).toBeInstanceOf(FinancialNotFound);
  });
});
