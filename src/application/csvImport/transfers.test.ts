import { matchTransferCategory, transferKeyOf } from "./transfers";

it("SHOULD match the export names of each side by the type of the row, in both languages", () => {
  expect(matchTransferCategory("Transferência enviada", "EXPENSE")).toBe(
    "00000000-0000-4000-8000-000000000006",
  );
  expect(matchTransferCategory("transfer in", "INCOME")).toBe(
    "00000000-0000-4000-8000-000000000007",
  );
  expect(matchTransferCategory("Tarifas de transferencia", "EXPENSE")).toBe(
    "00000000-0000-4000-8000-000000000008",
  );
});

it("SHOULD not match the wrong type or an unknown name", () => {
  expect(matchTransferCategory("Transfer in", "EXPENSE")).toBeUndefined();
  expect(matchTransferCategory("Mercado", "EXPENSE")).toBeUndefined();
});

it("SHOULD name the key of a transfer category id", () => {
  expect(transferKeyOf("00000000-0000-4000-8000-000000000007")).toBe(
    "TRANSFER_IN",
  );
  expect(transferKeyOf("other")).toBeUndefined();
});
