import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";
import { getAvatarTone } from "@components";

import InviteUIModel from "./InviteUIModel";

function dto(emailMatches: boolean, familyName = "Test Family") {
  return new FamilyInviteDTO({
    email: "bob@example.test",
    emailMatches,
    familyId: "family-1",
    familyName,
    inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
  });
}

it("SHOULD expose the family name and the invited email", () => {
  const ui = new InviteUIModel(dto(true));

  expect(ui.familyName).toBe("Test Family");
  expect(ui.email).toBe("bob@example.test");
});

it.each([[true], [false]])(
  "SHOULD allow accepting only WHEN the email matches (%s)",
  (matches) => {
    expect(new InviteUIModel(dto(matches)).canAccept).toBe(matches);
  },
);

it.each([
  ["Test Family", "T"],
  ["🏠 Casa", "🏠"],
  [" casa", "C"],
])("SHOULD derive the initial of %p as %p", (familyName, initial) => {
  expect(new InviteUIModel(dto(true, familyName)).initial).toBe(initial);
});

it("SHOULD derive the tone from the family name", () => {
  expect(new InviteUIModel(dto(true)).tone).toBe(getAvatarTone("Test Family"));
});
