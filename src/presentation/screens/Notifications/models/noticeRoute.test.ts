import { resolveNoticeTarget } from "./noticeRoute";

it("SHOULD open the stock item modal with the item and the owner", () => {
  expect(
    resolveNoticeTarget("/stock/items/item-1?lot=lot-1&ownerId=owner-1"),
  ).toEqual({
    params: { itemId: "item-1", ownerId: "owner-1" },
    pathname: "/stock/add_new_stock_item",
  });
  expect(resolveNoticeTarget("/stock/items/item-1")).toEqual({
    params: { itemId: "item-1" },
    pathname: "/stock/add_new_stock_item",
  });
});

it("SHOULD open the transaction modal over the transactions", () => {
  expect(resolveNoticeTarget("/finance/transactions/tx-1")).toEqual({
    params: { id: "tx-1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
});

it("SHOULD open the invoice detail with the card and the month", () => {
  expect(resolveNoticeTarget("/credit-cards/card-1/invoices/2026-11")).toEqual({
    params: { cardId: "card-1", month: "2026-11" },
    pathname: "/financial/cards/invoice_detail",
  });
});

it("SHOULD send a projected occurrence to the transactions AND anything else to the center", () => {
  expect(
    resolveNoticeTarget("/finance/recurrences/rec-1/occurrences/4").pathname,
  ).toBe("/financial/transaction");
  expect(resolveNoticeTarget("/notifications").pathname).toBe("/notifications");
  expect(resolveNoticeTarget("").pathname).toBe("/notifications");
});
