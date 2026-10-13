import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";

import InviteUIModel from "./InviteUIModel";

function dto(emailMatches: boolean) {
  return new FamilyInviteDTO({
    email: "bob@example.test",
    emailMatches,
    familyId: "family-1",
    familyName: "Test Family",
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
