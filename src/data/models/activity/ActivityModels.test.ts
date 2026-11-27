import ActivityModels from "./ActivityModels";

describe("pageFromJSON", () => {
  it("SHOULD map an entry with its summary, changes AND the cursor", () => {
    const page = ActivityModels.pageFromJSON({
      items: [
        {
          action: "UPDATE",
          actor: { id: null, name: "Ana" },
          batch: false,
          batchPreview: null,
          changes: [{ field: "amountCents", from: 230000, to: 245000 }],
          entityId: "t-1",
          entityType: "TRANSACTION",
          id: "a-1",
          itemExists: true,
          modules: ["FINANCE", "INVESTMENT", "FINANCE"],
          occurredAt: "2026-11-24T14:42:10.000Z",
          owner: { id: "f-1", name: "Família Silva", type: "FAMILY" },
          summary: {
            amountCents: -120000,
            bookingDate: "2022-04-15",
            currency: "BRL",
            label: "Mercado",
            sources: ["Conta corrente"],
          },
        },
      ],
      nextCursor: "c2",
    });

    expect(page.nextCursor).toBe("c2");
    expect(page.items[0]).toEqual({
      action: "UPDATE",
      actor: { id: null, name: "Ana" },
      batch: false,
      batchPreview: null,
      changes: [{ field: "amountCents", from: 230000, to: 245000 }],
      entityId: "t-1",
      entityType: "TRANSACTION",
      id: "a-1",
      itemExists: true,
      modules: ["FINANCE", "INVESTMENT"],
      occurredAt: "2026-11-24T14:42:10.000Z",
      owner: { id: "f-1", name: "Família Silva", type: "FAMILY" },
      summary: {
        amountCents: -120000,
        bookingDate: "2022-04-15",
        currency: "BRL",
        extra: undefined,
        label: "Mercado",
        sources: ["Conta corrente"],
      },
    });
  });

  it("SHOULD map a batch preview AND tolerate missing or unknown values", () => {
    const page = ActivityModels.pageFromJSON({
      items: [
        {
          action: "NOPE",
          batch: true,
          batchPreview: { count: 128, labels: ["Padaria", "Posto"] },
          entityType: "NOPE",
        },
      ],
    });

    expect(page.nextCursor).toBeNull();
    expect(page.items[0]).toMatchObject({
      action: "CREATE",
      batch: true,
      batchPreview: { count: 128, labels: ["Padaria", "Posto"] },
      changes: null,
      entityId: null,
      entityType: "TRANSACTION",
      itemExists: false,
      modules: [],
    });
    expect(ActivityModels.pageFromJSON({}).items).toEqual([]);
  });
});

describe("batchPageFromJSON", () => {
  it("SHOULD map the header on the first page AND the items", () => {
    const page = ActivityModels.batchPageFromJSON({
      header: {
        bookingFrom: "2026-10-01",
        bookingTo: "2026-10-31",
        count: 128,
        existing: 126,
        sources: ["Conta corrente"],
        totals: [{ amountCents: -841237, currency: "BRL" }],
      },
      items: [
        {
          action: "CREATE",
          amountCents: -2350,
          bookingDate: "2026-10-31",
          currency: "BRL",
          entityId: "e-1",
          entityType: "TRANSACTION",
          itemExists: true,
          label: "Padaria",
          sourceName: "Conta corrente",
        },
      ],
      nextCursor: null,
    });

    expect(page.header).toEqual({
      bookingFrom: "2026-10-01",
      bookingTo: "2026-10-31",
      count: 128,
      existing: 126,
      sources: ["Conta corrente"],
      totals: [{ amountCents: -841237, currency: "BRL" }],
    });
    expect(page.items[0]).toMatchObject({ itemExists: true, label: "Padaria" });
    expect(page.nextCursor).toBeNull();
  });

  it("SHOULD have no header WHEN the API sends none", () => {
    expect(
      ActivityModels.batchPageFromJSON({ header: null }).header,
    ).toBeNull();
    expect(ActivityModels.batchPageFromJSON({}).items).toEqual([]);
  });
});
