import DailyBalanceModel from "./DailyBalanceModel";

it("SHOULD map the API payload keeping cents", () => {
  const model = DailyBalanceModel.fromJSON({
    accounts: [
      {
        icon: "bank",
        id: "a1",
        name: "Checking",
        owner: "USER",
        ownerId: "u1",
      },
    ],
    days: [
      {
        accounts: [{ accountId: "a1", balance: 157000 }],
        cardsDue: -45000,
        date: "2026-11-05",
        projected: true,
        total: 112000,
      },
    ],
    month: "2026-11",
  });

  expect(model.month).toBe("2026-11");
  expect(model.accounts[0].name).toBe("Checking");
  expect(model.days[0]).toEqual({
    accounts: [{ accountId: "a1", balanceCents: 157000 }],
    cardsDueCents: -45000,
    date: "2026-11-05",
    projected: true,
    totalCents: 112000,
  });
});
