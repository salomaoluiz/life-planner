import fitValue from "./fitValue";

const base = {
  compact: "R$ 312 mil",
  full: "R$ 312.480,55",
  sizes: { full: 22, small: 16 },
};

it("SHOULD keep the full value at the tile size WHEN it fits", () => {
  expect(fitValue({ ...base, width: 240 })).toEqual({
    fit: "full",
    text: "R$ 312.480,55",
  });
});

it("SHOULD use the full value one size smaller WHEN only that fits", () => {
  expect(fitValue({ ...base, width: 150 })).toEqual({
    fit: "small",
    text: "R$ 312.480,55",
  });
});

it("SHOULD fall back to the compact format as the last resort", () => {
  expect(fitValue({ ...base, width: 90 })).toEqual({
    fit: "compact",
    text: "R$ 312 mil",
  });
});

it("SHOULD keep the full value WHEN there is no compact one OR the width is not measured yet", () => {
  expect(fitValue({ ...base, compact: undefined, width: 20 }).text).toBe(
    "R$ 312.480,55",
  );
  expect(fitValue({ ...base, width: undefined }).fit).toBe("full");
});
