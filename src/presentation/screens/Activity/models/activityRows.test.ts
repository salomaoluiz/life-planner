import { ActivityEntryEntity } from "@domain/entities/activity/ActivityEntity";

import {
  buildActivityDays,
  fieldLabel,
  formatChangeValue,
  isUnusualBooking,
  Translate,
  whoOf,
} from "./activityRows";

const dictionary: Record<string, string> = {
  "activity.bookedOn": "booked on {{date}}",
  "activity.entity.TRANSACTION": "the transaction",
  "activity.field.amountCents": "Amount",
  "activity.itemDeleted": "deleted",
  "activity.items.count_other": "{{count}} items",
  "activity.no": "No",
  "activity.none": "—",
  "activity.personal": "Personal",
  "activity.verb.buy": "bought",
  "activity.verb.closePurchase": "closed at {{market}}",
  "activity.verb.create": "created",
  "activity.verb.import": "imported {{count}}",
  "activity.verb.update": "edited",
  "activity.yes": "Yes",
  "activity.you": "You",
  "common.date.today": "Today",
  "common.date.yesterday": "Yesterday",
};
function t(key: Parameters<Translate>[0], options?: Record<string, unknown>) {
  return (dictionary[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    String(options?.[name] ?? ""),
  );
}
const context = {
  currentUserId: "u-1",
  languageTag: "en-US",
  showOwner: true,
  t,
  today: "2026-11-27",
};

function entry(
  overrides: Partial<ActivityEntryEntity> = {},
): ActivityEntryEntity {
  return {
    action: "CREATE",
    actor: { id: "u-1", name: "Ana" },
    batch: false,
    batchPreview: null,
    changes: null,
    entityId: "t-1",
    entityType: "TRANSACTION",
    id: "a-1",
    itemExists: true,
    modules: ["FINANCE"],
    occurredAt: new Date(2026, 10, 27, 11, 42).toISOString(),
    owner: { id: "f-1", name: "Família Silva", type: "FAMILY" },
    summary: {
      amountCents: -120000,
      bookingDate: "2022-04-15",
      currency: "BRL",
      label: "Mercado",
      sources: ["Conta corrente"],
    },
    ...overrides,
  };
}

describe("buildActivityDays", () => {
  it("SHOULD group by the local day with Today and Yesterday labels", () => {
    const days = buildActivityDays(
      [
        entry(),
        entry({
          id: "a-2",
          occurredAt: new Date(2026, 10, 26, 9, 0).toISOString(),
        }),
        entry({
          id: "a-3",
          occurredAt: new Date(2026, 10, 20, 9, 0).toISOString(),
        }),
      ],
      context,
    );

    expect(days.map((day) => day.label.slice(0, 5))).toEqual([
      "Today",
      "Yeste",
      "Novem",
    ]);
    expect(days[0].rows).toHaveLength(1);
  });

  it("SHOULD build the sentence, the meta line AND flag a far booking date", () => {
    const [row] = buildActivityDays([entry()], context)[0].rows;

    expect(row).toMatchObject({
      gone: false,
      label: "Mercado",
      metaWarning: true,
      ownerLabel: "Família Silva",
      verb: "created the transaction",
      who: "You",
    });
    expect(row.meta).toContain("Conta corrente");
    expect(row.meta).toContain("booked on");
    expect(row.target).toMatchObject({ modal: "add_new_transaction" });
  });

  it("SHOULD show before → after for an update, an item deleted marker for a delete", () => {
    const [update] = buildActivityDays(
      [
        entry({
          action: "UPDATE",
          actor: { id: "u-2", name: "Ana" },
          changes: [
            { field: "amountCents", from: -230000, to: -245000 },
            { field: "paid", from: false, to: true },
          ],
        }),
      ],
      context,
    )[0].rows;
    const [removed] = buildActivityDays(
      [entry({ action: "DELETE", itemExists: false })],
      context,
    )[0].rows;

    expect(update.who).toBe("Ana");
    expect(update.diffs.map((diff) => diff.field)).toEqual(["Amount", "paid"]);
    expect(update.diffs[1]).toMatchObject({ from: "No", to: "Yes" });
    expect(removed).toMatchObject({ gone: true, target: null });
  });

  it("SHOULD describe a batch import, a purchase close AND a purchase operation", () => {
    const rows = buildActivityDays(
      [
        entry({
          batch: true,
          batchPreview: { count: 128, labels: [] },
          entityId: null,
          entityType: "TRANSACTION_IMPORT",
          summary: { extra: { fileName: "extrato.csv" }, label: "CSV" },
        }),
        entry({
          entityType: "STOCK_PURCHASE_POSTING",
          id: "a-2",
          summary: { extra: { market: "Mercado Exemplo" }, label: "x" },
        }),
        entry({
          entityType: "OPERATION",
          id: "a-3",
          summary: { extra: { operationType: "BUY" }, label: "PETR4" },
        }),
      ],
      context,
    )[0].rows;

    expect(rows[0]).toMatchObject({
      fileName: "extrato.csv",
      isBatch: true,
      verb: "imported 128",
    });
    expect(rows[0].meta).toContain("128 items");
    expect(rows[1].verb).toBe("closed at Mercado Exemplo");
    expect(rows[2]).toMatchObject({ label: "PETR4", verb: "bought" });
  });

  it("SHOULD hide the owner chip WHEN the user has no family AND call a personal owner Personal", () => {
    const personal = entry({ owner: { id: "u-1", name: "Ana", type: "USER" } });

    expect(
      buildActivityDays([personal], { ...context, showOwner: false })[0].rows[0]
        .ownerLabel,
    ).toBe("");
    expect(buildActivityDays([personal], context)[0].rows[0].ownerLabel).toBe(
      "Personal",
    );
  });
});

describe("helpers", () => {
  it("SHOULD keep the stored name for a deleted account", () => {
    expect(whoOf(entry({ actor: { id: null, name: "Bia" } }), context)).toBe(
      "Bia",
    );
  });

  it("SHOULD flag a booking date more than 60 days from the action", () => {
    expect(isUnusualBooking("2026-10-01", "2026-11-27T10:00:00Z")).toBe(false);
    expect(isUnusualBooking("2026-09-01", "2026-11-27T10:00:00Z")).toBe(true);
    expect(isUnusualBooking(undefined, "2026-11-27T10:00:00Z")).toBe(false);
  });

  it("SHOULD format money, dates, booleans, lists AND empty values", () => {
    expect(formatChangeValue("amountCents", -245000, context, "BRL")).toContain(
      "2,450.00",
    );
    expect(formatChangeValue("date", "2026-11-05", context)).toBe("11/5/2026");
    expect(formatChangeValue("paid", true, context)).toBe("Yes");
    expect(formatChangeValue("tags", ["a", "b"], context)).toBe("a, b");
    expect(formatChangeValue("tags", [], context)).toBe("—");
    expect(formatChangeValue("notes", null, context)).toBe("—");
    expect(formatChangeValue("name", "Casa", context)).toBe("Casa");
  });

  it("SHOULD fall back to the raw field name WHEN there is no label", () => {
    expect(fieldLabel("amountCents", t)).toBe("Amount");
    expect(fieldLabel("mystery", t)).toBe("mystery");
  });
});
