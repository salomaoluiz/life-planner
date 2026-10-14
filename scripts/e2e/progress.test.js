import {
  findRunning,
  flowNameFromFile,
  formatElapsed,
  parseFinished,
  renderProgress,
} from "./progress.mjs";

const expected = [
  "auth/login",
  "auth/signup",
  "financial/accounts/edit-account",
];

it("SHOULD derive the flow name from its file path", () => {
  expect(
    flowNameFromFile("e2e/flows/financial/accounts/edit-account.yaml"),
  ).toBe("financial/accounts/edit-account");
});

it("SHOULD parse passed and failed lines and ignore ANSI codes and other output", () => {
  const log =
    "Waiting for flows to complete...\n\u001b[32m[Passed] auth/login (12s)\u001b[0m\r\n[Failed] auth/signup (1m 3s)\nnoise\n";

  const finished = parseFinished(log);

  expect([...finished.entries()]).toEqual([
    ["auth/login", { duration: "12s", passed: true }],
    ["auth/signup", { duration: "1m 3s", passed: false }],
  ]);
});

it("SHOULD report as running only started flows that are not finished", () => {
  const finished = parseFinished("[Passed] auth/login (3s)\n");

  expect(
    findRunning(expected, finished, [
      "auth_login",
      "financial_accounts_edit-account",
    ]),
  ).toEqual(["financial/accounts/edit-account"]);
});

it("SHOULD format elapsed time", () => {
  expect(formatElapsed(7)).toBe("7s");
  expect(formatElapsed(200)).toBe("3m20s");
});

it("SHOULD render passed, failed, running and pending flows with counts", () => {
  const finished = parseFinished(
    "[Passed] auth/login (3s)\n[Failed] auth/signup (5s)\n",
  );

  const lines = renderProgress({
    elapsedSeconds: 65,
    expected,
    finished,
    running: ["financial/accounts/edit-account"],
  });

  expect(lines).toEqual([
    "E2E progress: 2/3 done · 1 running · 0 pending · 1 failed · 1m05s",
    "  ✔ auth/login (3s)",
    "  ✖ auth/signup (5s)",
    "  ▶ financial/accounts/edit-account (running)",
  ]);
});

it("SHOULD count flows that have not started as pending", () => {
  const lines = renderProgress({
    elapsedSeconds: 1,
    expected,
    finished: new Map(),
    running: [],
  });

  expect(lines[0]).toBe(
    "E2E progress: 0/3 done · 0 running · 3 pending · 0 failed · 1s",
  );
  expect(lines[1]).toBe("  · auth/login (pending)");
});
