import { getDateTimeFormat } from "./formatters";
import { formatDayTitle } from "./transactionList";

it("SHOULD return the same formatter for the same locale and options", () => {
  expect(getDateTimeFormat("en-US", { month: "long" })).toBe(
    getDateTimeFormat("en-US", { month: "long" }),
  );
});

it("SHOULD return another formatter for another locale or other options", () => {
  const base = getDateTimeFormat("en-US", { month: "long" });

  expect(getDateTimeFormat("pt-BR", { month: "long" })).not.toBe(base);
  expect(getDateTimeFormat("en-US", { month: "short" })).not.toBe(base);
});

it("SHOULD not build a new Intl.DateTimeFormat for every day title", () => {
  formatDayTitle(new Date(2026, 8, 30), "es-ES");
  const spy = jest.spyOn(Intl, "DateTimeFormat");

  for (let index = 0; index < 100; index += 1) {
    formatDayTitle(new Date(2026, 8, 30), "es-ES");
  }

  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});
