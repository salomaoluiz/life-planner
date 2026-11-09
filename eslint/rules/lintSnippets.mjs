// Test helper: lints snippets with the presentation guardrails in plain Node
// (ESLint cannot run inside Jest's Babel transform). stdin: [{ code, filename }], stdout: string[][].
import { Linter } from "eslint";

import guardrails from "./presentation-guardrails.mjs";

const linter = new Linter({ configType: "flat" });
let input = "";

process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const cases = JSON.parse(input);
  const result = cases.map(({ code, filename }) =>
    linter
      .verify(code, guardrails, { filename })
      .map((message) => message.message),
  );

  process.stdout.write(JSON.stringify(result));
});
