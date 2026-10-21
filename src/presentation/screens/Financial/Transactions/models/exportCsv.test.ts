import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  defaultExportFormat,
  exportPreset,
  exportScope,
  presetOf,
  toExportQuery,
  validateExportPeriod,
} from "./exportCsv";

const today = new Date(2026, 9, 21);
const owners = [
  new OwnerDTO({ id: "u1", name: "Me", type: OwnerType.USER }),
  new OwnerDTO({ id: "f1", name: "Família", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "f2",
    name: "Antiga",
    type: OwnerType.FAMILY,
  }),
];

describe("exportPreset", () => {
  it("SHOULD give this month, the last 12 months and this year", () => {
    expect(exportPreset("THIS_MONTH", today)).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
    expect(exportPreset("LAST_12_MONTHS", today)).toEqual({
      from: "2025-11-01",
      to: "2026-10-31",
    });
    expect(exportPreset("THIS_YEAR", today)).toEqual({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });

  it("SHOULD recognise a preset period and call a custom one undefined", () => {
    expect(presetOf({ from: "2026-01-01", to: "2026-12-31" }, today)).toBe(
      "THIS_YEAR",
    );
    expect(presetOf({ from: "2026-02-01", to: "2026-12-31" }, today)).toBe(
      undefined,
    );
  });

  it("SHOULD validate the 2-year limit like the filters (spec 045)", () => {
    expect(validateExportPeriod("2026-01-01", "2027-12-31")).toEqual({
      ok: true,
    });
    expect(validateExportPeriod("2026-01-01", "2028-01-01")).toEqual({
      maxTo: "2027-12-31",
      ok: false,
    });
  });
});

describe("defaultExportFormat", () => {
  it.each([
    ["pt-BR", "BR"],
    ["pt", "BR"],
    ["en-US", "INTL"],
  ])("SHOULD default %s to %s", (tag, expected) => {
    expect(defaultExportFormat(tag)).toBe(expected);
  });
});

describe("exportScope / toExportQuery", () => {
  it("SHOULD map All, Personal and a family (archived too) to the API scope", () => {
    expect(exportScope("ALL", owners)).toEqual({ owner: "ALL" });
    expect(exportScope("u1", owners)).toEqual({ owner: "USER" });
    expect(exportScope("f2", owners)).toEqual({
      owner: "FAMILY",
      ownerId: "f2",
    });
  });

  it("SHOULD send the chosen accounts and cards and leave empty lists out", () => {
    const period = { from: "2026-01-01", to: "2026-12-31" };

    expect(
      toExportQuery(
        { accountIds: ["a1"], cardIds: [], ownerSelection: "ALL", period },
        owners,
      ),
    ).toEqual({
      accountIds: ["a1"],
      creditCardIds: undefined,
      from: "2026-01-01",
      owner: "ALL",
      to: "2026-12-31",
    });
  });
});
