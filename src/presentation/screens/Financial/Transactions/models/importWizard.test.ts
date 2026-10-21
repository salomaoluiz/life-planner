import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  defaultImportOwner,
  importOwnerChoices,
  nextStep,
  previousStep,
} from "./importWizard";

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

describe("importOwnerChoices", () => {
  it("SHOULD offer Personal and the active families, never an archived one", () => {
    expect(importOwnerChoices(owners).map((choice) => choice.value)).toEqual([
      "u1",
      "f1",
    ]);
  });
});

describe("defaultImportOwner", () => {
  it.each([
    ["u1", "u1"],
    ["f1", "f1"],
    ["ALL", "u1"],
    ["f2", "u1"],
    ["stranger", "u1"],
  ])("SHOULD default the screen scope %s to %s", (screenOwner, expected) => {
    expect(defaultImportOwner(owners, screenOwner)).toBe(expected);
  });
});

describe("steps", () => {
  it("SHOULD walk file → columns → values → review and stop at the ends", () => {
    expect(nextStep("file")).toBe("columns");
    expect(nextStep("values")).toBe("review");
    expect(nextStep("review")).toBe("review");
    expect(previousStep("review")).toBe("values");
    expect(previousStep("file")).toBe("file");
  });
});
