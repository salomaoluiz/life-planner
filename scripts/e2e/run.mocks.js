import { junit } from "./summarize.mocks";

export const enabledEnv = { E2E_ENABLED: "true", E2E_WORKERS: "1" };

export function createDeps(overrides = {}) {
  const files = {
    "e2e-report/junit.xml": junit([{ name: "auth/login" }]),
    ...overrides.files,
  };
  const printed = [];
  const written = {};
  const deps = {
    exec: jest.fn(() => ({ status: 0 })),
    exists: jest.fn(() => true),
    fetchStatus: jest.fn(async () => 200),
    hasCommand: jest.fn(() => true),
    listFiles: jest.fn(() => []),
    mkdir: jest.fn(),
    now: jest.fn().mockReturnValueOnce(0).mockReturnValue(192000),
    print: jest.fn((text) => printed.push(text)),
    readFile: jest.fn((path) => files[path] ?? null),
    removeReportFiles: jest.fn(),
    revisions: jest.fn(() => ""),
    startProgress: jest.fn(() => jest.fn()),
    writeFile: jest.fn((path, content) => {
      written[path] = content;
    }),
    ...overrides.deps,
  };

  return { deps, printed, written };
}
