import enUS from "@presentation/i18n/translations/en-US";
import ptBR from "@presentation/i18n/translations/pt-BR";

import { recurrenceLabel, recurrenceLabelEvery } from "./recurrenceLabel";

type Dictionary = Record<string, unknown>;

function translator(dictionary: Dictionary) {
  return (key: string, params?: Record<string, number | string>) => {
    const value = key
      .split(".")
      .reduce<unknown>((node, part) => (node as Dictionary)?.[part], dictionary);

    return String(value).replace(/\{\{(\w+)\}\}/g, (_m, name) =>
      String(params?.[name]),
    );
  };
}

const pt = translator(ptBR.translation as unknown as Dictionary);
const en = translator(enUS.translation as unknown as Dictionary);

describe("recurrenceLabel", () => {
  it.each([
    [{ interval: 1, unit: "DAY" }, "Diária", "Daily"],
    [{ interval: 1, unit: "WEEK" }, "Semanal", "Weekly"],
    [{ interval: 1, unit: "MONTH" }, "Mensal", "Monthly"],
    [{ interval: 1, unit: "YEAR" }, "Anual", "Yearly"],
    [{ interval: 2, unit: "WEEK" }, "A cada 2 semanas", "Every 2 weeks"],
    [{ interval: 2, unit: "MONTH" }, "A cada 2 meses", "Every 2 months"],
    [{ interval: 15, unit: "DAY" }, "A cada 15 dias", "Every 15 days"],
    [{ interval: 3, unit: "YEAR" }, "A cada 3 anos", "Every 3 years"],
  ] as const)("SHOULD read %j as %s / %s", (frequency, expectedPt, expectedEn) => {
    expect(recurrenceLabel(pt, frequency)).toBe(expectedPt);
    expect(recurrenceLabel(en, frequency)).toBe(expectedEn);
  });
});

describe("recurrenceLabelEvery", () => {
  it("SHOULD use the lowercase variant", () => {
    expect(recurrenceLabelEvery(pt, { interval: 1, unit: "MONTH" })).toBe(
      "a cada mês",
    );
    expect(recurrenceLabelEvery(pt, { interval: 3, unit: "WEEK" })).toBe(
      "a cada 3 semanas",
    );
    expect(recurrenceLabelEvery(en, { interval: 1, unit: "MONTH" })).toBe(
      "every month",
    );
    expect(recurrenceLabelEvery(en, { interval: 2, unit: "YEAR" })).toBe(
      "every 2 years",
    );
  });
});
