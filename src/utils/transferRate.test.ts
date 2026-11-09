import { amountInFromRate, computeRate, parseRate } from "./transferRate";

it("SHOULD read 5000 BRL for 920 USD as 1 USD = 5.4348 BRL", () => {
  expect(computeRate(500000, 92000)).toEqual({ base: "IN", value: 5.4348 });
});

it("SHOULD flip the direction WHEN the amount in is the larger one", () => {
  expect(computeRate(92000, 500000)).toEqual({ base: "OUT", value: 5.4348 });
});

it("SHOULD have no rate WHEN an amount is missing", () => {
  expect(computeRate(0, 100)).toBeUndefined();
  expect(computeRate(100, 0)).toBeUndefined();
});

it("SHOULD fill the amount in from a typed rate AND ignore a rate that is not positive", () => {
  expect(amountInFromRate(500000, 5.4348)).toBe(92000);
  expect(amountInFromRate(500000, 0)).toBe(0);
  expect(amountInFromRate(0, 5)).toBe(0);
  expect(amountInFromRate(500000, Number.NaN)).toBe(0);
});

it("SHOULD parse a rate with a comma or a point AND reject garbage", () => {
  expect(parseRate("5,4348")).toBe(5.4348);
  expect(parseRate(" 5.4348 ")).toBe(5.4348);
  expect(parseRate("abc")).toBe(0);
  expect(parseRate("-1")).toBe(0);
});
