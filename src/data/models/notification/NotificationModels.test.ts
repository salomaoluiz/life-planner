import NotificationModels from "./NotificationModels";

describe("pageFromJSON", () => {
  it("SHOULD map notices, items and the cursor", () => {
    const page = NotificationModels.pageFromJSON({
      items: [
        {
          createdAt: "2026-11-23T11:00:04.000Z",
          id: "n-1",
          items: [
            {
              dueDate: "2026-11-23",
              route: "/stock/items/i?lot=l&ownerId=o",
              snapshot: { description: "Iogurte", quantity: 2 },
              state: "DUE_TODAY",
              type: "STOCK_EXPIRING",
            },
          ],
          kind: "SUMMARY",
          localDate: "2026-11-23",
          readAt: null,
          title: "Hoje: 1 avisos",
        },
      ],
      nextCursor: "abc",
    });

    expect(page.nextCursor).toBe("abc");
    expect(page.items[0]).toEqual(
      expect.objectContaining({ id: "n-1", kind: "SUMMARY", readAt: null }),
    );
    expect(page.items[0].items[0].snapshot.description).toBe("Iogurte");
  });

  it("SHOULD tolerate a missing list AND unknown enums", () => {
    const page = NotificationModels.pageFromJSON({
      items: [{ items: [{ state: "NOPE", type: "NOPE" }], kind: "NOPE" }],
    });

    expect(page.nextCursor).toBeNull();
    expect(page.items[0].kind).toBe("SUMMARY");
    expect(page.items[0].items[0]).toEqual(
      expect.objectContaining({ state: "UPCOMING", type: "STOCK_EXPIRING" }),
    );
    expect(NotificationModels.pageFromJSON({}).items).toEqual([]);
  });
});

describe("preferencesFromJSON", () => {
  it("SHOULD map the preferences with the type switches AND the families", () => {
    const preferences = NotificationModels.preferencesFromJSON({
      billLeadDays: 5,
      families: [{ enabled: false, familyId: "f1", name: "Casa" }],
      locale: "en-US",
      summaryTime: "09:00",
      types: { FINANCE_INVOICE_DUE: false },
    });

    expect(preferences).toEqual(
      expect.objectContaining({
        billLeadDays: 5,
        locale: "en-US",
        summaryTime: "09:00",
      }),
    );
    expect(preferences.types).toEqual({
      FINANCE_BILL_DUE: true,
      FINANCE_INVOICE_DUE: false,
      STOCK_EXPIRING: true,
      STOCK_OPENED_EXPIRING: true,
    });
    expect(preferences.families).toEqual([
      { enabled: false, familyId: "f1", name: "Casa" },
    ]);
  });

  it("SHOULD fall back to the defaults", () => {
    expect(NotificationModels.preferencesFromJSON({})).toEqual(
      expect.objectContaining({
        billLeadDays: 3,
        locale: "pt-BR",
        quietEnd: "07:00",
        quietStart: "22:00",
        summaryTime: "08:00",
        tickMinutes: 15,
      }),
    );
  });
});

describe("deviceFromJSON", () => {
  it("SHOULD map a device AND fall back for unknown values", () => {
    expect(
      NotificationModels.deviceFromJSON({
        enabled: false,
        id: "d-1",
        lastSeenAt: "2026-11-23T11:00:00.000Z",
        name: "iPhone",
        platform: "IOS",
        provider: "EXPO",
      }),
    ).toEqual({
      enabled: false,
      id: "d-1",
      lastSeenAt: "2026-11-23T11:00:00.000Z",
      name: "iPhone",
      platform: "IOS",
      provider: "EXPO",
    });
    expect(NotificationModels.deviceFromJSON({})).toEqual(
      expect.objectContaining({
        enabled: true,
        platform: "WEB",
        provider: "WEB_PUSH",
      }),
    );
  });
});
