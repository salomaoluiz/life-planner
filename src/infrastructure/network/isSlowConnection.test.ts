import isSlowConnection from "./isSlowConnection";

function setConnection(connection: unknown) {
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: { connection },
  });
}

const original = Object.getOwnPropertyDescriptor(global, "navigator");

afterEach(() => {
  if (original) {
    Object.defineProperty(global, "navigator", original);
  }
});

it.each([
  [{ saveData: true }, true],
  [{ effectiveType: "2g" }, true],
  [{ effectiveType: "slow-2g" }, true],
  [{ effectiveType: "4g" }, false],
  [{ effectiveType: "3g", saveData: false }, false],
  [undefined, false],
])("SHOULD answer for the connection %j", (connection, expected) => {
  setConnection(connection);

  expect(isSlowConnection()).toBe(expected);
});

it("SHOULD be false WHEN there is no navigator", () => {
  Object.defineProperty(global, "navigator", {
    configurable: true,
    value: undefined,
  });

  expect(isSlowConnection()).toBe(false);
});
