// Maestro runScript (GraalJS). Teardown: deletes the throwaway users a flow created (main user and the
// MEMBER_/OTHER_/STRANGER_ extra users) through DELETE /v1/user/me, which also removes their data.
// Reads E2E_API_URL and the flow's output (EMAIL, PASSWORD, <PREFIX>EMAIL, <PREFIX>PASSWORD). Never logs
// credentials, never fails the flow, and only touches emails shaped like e2e+<suffix>@example.com.
var headers = { "Content-Type": "application/json" };
var prefixes = ["", "MEMBER_", "OTHER_", "STRANGER_"];

function isE2eEmail(email) {
  return (
    typeof email === "string" &&
    email.indexOf("e2e+") === 0 &&
    email.indexOf("@example.com") === email.length - "@example.com".length
  );
}

for (var i = 0; i < prefixes.length; i++) {
  var email = output[prefixes[i] + "EMAIL"];
  var password = output[prefixes[i] + "PASSWORD"];
  if (!isE2eEmail(email) || typeof password !== "string") {
    continue;
  }
  try {
    var login = http.post(E2E_API_URL + "/v1/auth/login/email", {
      headers: headers,
      body: JSON.stringify({ email: email, password: password }),
    });
    // Not ok: the user never existed or the flow already deleted it.
    if (login.ok) {
      http.request(E2E_API_URL + "/v1/user/me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + json(login.body).token,
        },
        body: JSON.stringify({ email: email }),
      });
    }
  } catch (error) {
    // Cleanup is best effort: a failure here must not hide the flow's own result.
  }
}
