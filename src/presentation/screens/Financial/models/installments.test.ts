import {
  installmentInvoiceRange,
  installmentPreview,
  installmentTitle,
  isValidInstallmentCount,
  splitInstallmentCents,
} from "./installments";

it("SHOULD split with the remainder on the first installment (same rule as the API)", () => {
  expect(splitInstallmentCents(10000, 3)).toEqual([3334, 3333, 3333]);
  expect(splitInstallmentCents(512000, 10)).toEqual(Array(10).fill(51200));

  const parts = splitInstallmentCents(100, 48);

  expect(parts[0]).toBe(6);
  expect(parts.reduce((sum, part) => sum + part, 0)).toBe(100);
});

it("SHOULD preview the first and the other installments", () => {
  expect(installmentPreview(10000, 3)).toEqual({
    first: 3334,
    hasRemainder: true,
    others: 3333,
  });
  expect(installmentPreview(512000, 10).hasRemainder).toBe(false);
});

it("SHOULD give the first and last invoice month, rolling over the year", () => {
  expect(installmentInvoiceRange("2026-10", 10)).toEqual({
    first: "2026-10",
    last: "2027-07",
  });
  expect(installmentInvoiceRange("2026-10", 2).last).toBe("2026-11");
});

it.each([
  [2, true],
  [48, true],
  [1, false],
  [49, false],
  [2.5, false],
  [Number.NaN, false],
])("SHOULD validate the count %s as %s", (count, expected) => {
  expect(isValidInstallmentCount(count)).toBe(expected);
});

it("SHOULD title an installment as description k/n AND a plain purchase as the description", () => {
  function format(params: { description: string; k: number; n: number }) {
    return `${params.description} ${params.k}/${params.n}`;
  }

  expect(installmentTitle("Notebook", { count: 10, number: 3 }, format)).toBe(
    "Notebook 3/10",
  );
  expect(installmentTitle("Notebook", undefined, format)).toBe("Notebook");
});
