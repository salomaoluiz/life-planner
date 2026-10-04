import { encode } from "@infrastructure/crypto";

import { decodeRouteParams } from "./utils";

it("SHOULD decode the token and convert the invite date to a Date", async () => {
  const token = await encode({
    email: "bob@example.test",
    familyId: "family-1",
    inviteDate: "2025-01-01T00:00:00.000Z",
  });

  expect(await decodeRouteParams({ token })).toEqual({
    email: "bob@example.test",
    familyId: "family-1",
    inviteDate: new Date("2025-01-01T00:00:00.000Z"),
  });
});

it("SHOULD reject WHEN the token is not valid", async () => {
  await expect(
    decodeRouteParams({ token: "not-base64-json" }),
  ).rejects.toThrow();
});
