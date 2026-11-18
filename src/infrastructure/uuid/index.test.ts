import { uuidv4 } from "./index";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

it("SHOULD use crypto.randomUUID WHEN available", () => {
  const original = globalThis.crypto;

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { randomUUID: () => "from-crypto" },
  });

  expect(uuidv4()).toBe("from-crypto");

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: original,
  });
});

it("SHOULD fall back to a random v4 uuid", () => {
  const original = globalThis.crypto;

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: undefined,
  });

  const first = uuidv4();

  expect(first).toMatch(UUID);
  expect(uuidv4()).not.toBe(first);

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: original,
  });
});
