// Maestro runScript (GraalJS). Generates a fresh fake user; nothing is stored.
var suffix = Date.now() + "-" + Math.floor(Math.random() * 1000000);

output.EMAIL = "e2e+" + suffix + "@example.com";
output.NAME = "E2E User";
output.PASSWORD = "E2e-password-123";
