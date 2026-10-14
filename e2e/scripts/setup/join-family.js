// Maestro runScript (GraalJS). The family owner invites MEMBER_EMAIL and that user accepts, in one
// script so the invite token never leaves it (no env, no output, no log).
// Reads E2E_API_URL, OWNER_TOKEN, MEMBER_TOKEN, MEMBER_EMAIL, FAMILY_ID from env. Never logs tokens.
var invite = http.post(E2E_API_URL + "/v1/families/" + FAMILY_ID + "/members", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + OWNER_TOKEN,
  },
  body: JSON.stringify({ email: MEMBER_EMAIL }),
});
if (!invite.ok) {
  throw new Error("E2E setup: invite failed with status " + invite.status);
}

var inviteToken = json(invite.body).inviteToken;
var accept = http.post(
  E2E_API_URL +
    "/v1/family-invites/" +
    encodeURIComponent(inviteToken) +
    "/accept",
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + MEMBER_TOKEN,
    },
    body: "{}",
  },
);
if (!accept.ok) {
  throw new Error("E2E setup: accept failed with status " + accept.status);
}
