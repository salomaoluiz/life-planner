// Maestro runScript (GraalJS). Saves the current user (EMAIL, PASSWORD, TOKEN, REFRESH_TOKEN, USER_ID) under PREFIX,
// or restores it from PREFIX. Reads MODE ("save" | "restore") and PREFIX from env. Never logs values.
var keys = ["EMAIL", "PASSWORD", "TOKEN", "REFRESH_TOKEN", "USER_ID"];
for (var i = 0; i < keys.length; i++) {
  if (MODE === "save") {
    output[PREFIX + keys[i]] = output[keys[i]];
  } else {
    output[keys[i]] = output[PREFIX + keys[i]];
  }
}
