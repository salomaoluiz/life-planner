// Maestro runScript (GraalJS). Reads E2E_API_URL, TOKEN (a member of the family), FAMILY_ID, EMAIL. Throws if the family still lists EMAIL.
// Never logs tokens or passwords.
var response = http.get(
  E2E_API_URL + "/v1/families/" + FAMILY_ID + "/members",
  {
    headers: { Authorization: "Bearer " + TOKEN },
  },
);
if (response.status !== 200) {
  throw new Error(
    "E2E assert: members expected 200 but got " + response.status,
  );
}
var members = json(response.body);
for (var i = 0; i < members.length; i++) {
  if (String(members[i].email).toLowerCase() === String(EMAIL).toLowerCase()) {
    throw new Error("E2E assert: the user is still a member of the family");
  }
}
