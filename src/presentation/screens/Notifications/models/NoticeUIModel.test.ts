import { NotificationEntity } from "@domain/entities/notification/NotificationEntity";

import { toNoticeDays } from "./NoticeUIModel";

const labels = { today: "HOJE", yesterday: "ONTEM" };
function notice(
  overrides: Partial<NotificationEntity> = {},
): NotificationEntity {
  return {
    createdAt: "2026-11-23T11:00:04.000Z",
    id: "n-1",
    items: [
      {
        dueDate: "2026-11-25",
        route: "/r2",
        snapshot: {
          accountName: "Conta",
          currency: "BRL",
          description: "Luz",
          valueCents: 21430,
        },
        state: "UPCOMING",
        type: "FINANCE_BILL_DUE",
      },
      {
        dueDate: "2026-11-23",
        route: "/r1",
        snapshot: {
          description: "Iogurte",
          location: "Geladeira",
          ownerName: "Casa",
        },
        state: "DUE_TODAY",
        type: "STOCK_EXPIRING",
      },
    ],
    kind: "SUMMARY",
    localDate: "2026-11-23",
    readAt: null,
    title: "Hoje: 1 vencem, 1 nos próximos dias",
    ...overrides,
  };
}

it("SHOULD group the items by state in the order due today, overdue, upcoming", () => {
  const [day] = toNoticeDays([notice()], "pt-BR", "2026-11-23", labels);

  expect(day.label).toBe("HOJE");
  expect(day.rows[0].groups.map((group) => group.state)).toEqual([
    "DUE_TODAY",
    "UPCOMING",
  ]);
  expect(day.rows[0]).toEqual(
    expect.objectContaining({ isUnread: true, isUrgent: false, itemCount: 2 }),
  );
});

it("SHOULD show the amount in the center, the place and the owner AND a relative due label", () => {
  const [day] = toNoticeDays([notice()], "pt-BR", "2026-11-23", labels);
  const [today, upcoming] = day.rows[0].groups;

  expect(today.items[0].detail).toBe("Geladeira · Casa");
  expect(today.items[0].dueLabel).toBe("");
  expect(upcoming.items[0].detail).toContain("214,30");
  expect(upcoming.items[0].detail).toContain("Conta");
  expect(upcoming.items[0].dueLabel).toBe("depois de amanhã");
});

it("SHOULD name today, yesterday AND other days, keeping newest first within a day", () => {
  const days = toNoticeDays(
    [
      notice({ id: "a" }),
      notice({
        id: "b",
        localDate: "2026-11-22",
        readAt: "2026-11-22T12:00:00Z",
      }),
      notice({ id: "c", kind: "URGENT", localDate: "2026-11-20" }),
      notice({ id: "d", localDate: "2026-11-20" }),
    ],
    "pt-BR",
    "2026-11-23",
    labels,
  );

  expect(days.map((day) => day.label)).toEqual(["HOJE", "ONTEM", "20/11"]);
  expect(days[2].rows.map((row) => row.id)).toEqual(["c", "d"]);
  expect(days[1].rows[0].isUnread).toBe(false);
  expect(days[2].rows[0].isUrgent).toBe(true);
});
