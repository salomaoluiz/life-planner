// Maestro runScript (GraalJS). Creates the user in the API and logs in to get a token.
// Reads EMAIL, NAME, PASSWORD and E2E_API_URL from the flow env. Never logs the token.
var headers = { "Content-Type": "application/json" };

var signup = http.post(E2E_API_URL + "/v1/auth/signup/email", {
  headers: headers,
  body: JSON.stringify({ email: EMAIL, name: NAME, password: PASSWORD }),
});
if (!signup.ok) {
  throw new Error("E2E setup: signup failed with status " + signup.status);
}

var login = http.post(E2E_API_URL + "/v1/auth/login/email", {
  headers: headers,
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!login.ok) {
  throw new Error("E2E setup: login failed with status " + login.status);
}

output.TOKEN = json(login.body).token;
