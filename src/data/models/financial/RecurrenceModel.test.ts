import { calendarDateToIso } from "./calendarDate";
import { apiProjected, apiRecurrence } from "./mocks/Recurrence.mocks";
import ProjectedOccurrenceModel from "./ProjectedOccurrenceModel";
import RecurrenceModel from "./RecurrenceModel";

describe("RecurrenceModel.fromJSON", () => {
  it("SHOULD read the API payload: cents -> decimal string, calendar dates -> ISO, category name from the summary", () => {
    const model = RecurrenceModel.fromJSON(apiRecurrence);

    expect(model).toMatchObject({
      accountId: "account-1",
      category: "Rent",
      creditCardId: undefined,
      endDate: calendarDateToIso("2027-09-05"),
      firstNumber: 1,
      frequency: "MONTHLY",
      nextOccurrenceDate: calendarDateToIso("2026-11-05"),
      occurrenceCount: 12,
      startDate: calendarDateToIso("2026-10-05"),
      status: "ACTIVE",
      value: "2000.00",
    });
  });

  it("SHOULD leave the end date, the next date and the count empty WHEN the series has none", () => {
    const model = RecurrenceModel.fromJSON({
      ...apiRecurrence,
      category: undefined,
      endDate: null,
      nextOccurrenceDate: null,
      occurrenceCount: null,
    });

    expect(model.endDate).toBeUndefined();
    expect(model.nextOccurrenceDate).toBeUndefined();
    expect(model.occurrenceCount).toBeUndefined();
    expect(model.category).toBe("");
  });
});

describe("ProjectedOccurrenceModel.fromJSON", () => {
  it("SHOULD read an account projection", () => {
    expect(ProjectedOccurrenceModel.fromJSON(apiProjected)).toMatchObject({
      accountName: "Checking",
      category: "Rent",
      categoryId: "category-1",
      creditCardId: undefined,
      date: calendarDateToIso("2026-11-05"),
      occurrenceNumber: 2,
      recurrenceId: "recurrence-1",
      value: "2000.00",
    });
  });

  it("SHOULD read a card projection with its invoice", () => {
    const model = ProjectedOccurrenceModel.fromJSON({
      ...apiProjected,
      account: null,
      creditCard: { id: "card-1", title: "Card" },
      invoiceListDate: "2026-12-10",
      invoiceMonth: "2026-11",
      occurrenceCount: null,
    });

    expect(model).toMatchObject({
      accountId: undefined,
      creditCardId: "card-1",
      creditCardTitle: "Card",
      invoiceListDate: "2026-12-10",
      invoiceMonth: "2026-11",
      occurrenceCount: undefined,
    });
  });
});
