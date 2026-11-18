import { qrMatrix } from "./index";

it("SHOULD build a square matrix with the finder patterns in the corners", () => {
  const matrix = qrMatrix("https://app.example.com/stock/locations/1");
  const size = matrix.length;

  expect(size).toBeGreaterThanOrEqual(21);
  expect(matrix.every((row) => row.length === size)).toBe(true);
  // The 7x7 finder pattern has a dark border at the top-left, top-right and bottom-left corners.
  expect(matrix[0].slice(0, 7).every(Boolean)).toBe(true);
  expect(matrix[0].slice(size - 7).every(Boolean)).toBe(true);
  expect(matrix[size - 7].slice(0, 7).every(Boolean)).toBe(true);
});

it("SHOULD give the same matrix for the same text and a different one for another", () => {
  expect(qrMatrix("a")).toEqual(qrMatrix("a"));
  expect(qrMatrix("a")).not.toEqual(qrMatrix("b"));
});
