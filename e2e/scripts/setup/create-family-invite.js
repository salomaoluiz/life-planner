// Maestro runScript (GraalJS). The family owner invites EMAIL; the invite stays pending (never accepted).
// Reads E2E_API_URL, TOKEN, FAMILY_ID, EMAIL from env. Never logs the token or the invite link.
var response = http.post(
  E2E_API_URL + "/v1/families/" + FAMILY_ID + "/members",
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({ email: EMAIL }),
  },
);
if (!response.ok) {
  throw new Error("E2E setup: invite failed with status " + response.status);
}
