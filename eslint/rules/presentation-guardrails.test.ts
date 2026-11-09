import { execFileSync } from "node:child_process";
import { join } from "node:path";

interface Snippet {
  code: string;
  filename: string;
}

// One Node process lints every snippet (ESLint cannot run inside Jest's Babel transform).
function lintAll(snippets: Snippet[]): string[][] {
  return JSON.parse(
    execFileSync("node", [join(__dirname, "lintSnippets.mjs")], {
      input: JSON.stringify(snippets),
    }).toString(),
  );
}

const view = "src/presentation/screens/Fake/Thing/views/Wide.tsx";
const entry = "src/presentation/screens/Fake/Thing/index.tsx";
const block = "src/presentation/screens/Fake/Thing/Block.tsx";
const shell = "src/presentation/screens/Financial/Layout/hooks/useX.ts";
const legacy = "src/presentation/screens/Financial/Accounts/views/Wide.tsx";
const viewImports = [
  'import { useCases } from "@application/useCases";',
  'import { useQuery } from "@infrastructure/fetcher";',
  'import { router } from "expo-router";',
  'import { useIsFocused } from "@react-navigation/native";',
  'import useThingViewModel from "../hooks/useThingViewModel";',
];
const widthReads = [
  "useBreakpoint();",
  "useWindowDimensions();",
  "const { breakpoint } = useKitTheme();",
  "const value = useKitTheme().breakpoint;",
];

const snippets: Snippet[] = [
  ...viewImports.map((code) => ({ code, filename: view })),
  ...viewImports.map((code) => ({ code, filename: entry })),
  ...widthReads.map((code) => ({ code, filename: block })),
  { code: "useBreakpoint();", filename: shell },
  { code: "useBreakpoint();", filename: legacy },
  { code: "const a = { fontSize: 12 };", filename: legacy },
  {
    code: "useBreakpoint();",
    filename: "src/presentation/components/X/index.tsx",
  },
];
const results = lintAll(snippets);
const at = (index: number) => results[index];

describe("presentation guardrails (spec 099)", () => {
  it.each(viewImports.map((code, index) => [code, index] as const))(
    "SHOULD fail a View importing: %s",
    (_code, index) => {
      expect(at(index)).toHaveLength(1);
    },
  );

  it.each(viewImports.map((code, index) => [code, index] as const))(
    "SHOULD allow the screen entry to import: %s",
    (_code, index) => {
      expect(at(viewImports.length + index)).toEqual([]);
    },
  );

  it.each(widthReads.map((code, index) => [code, index] as const))(
    "SHOULD fail a screen file reading the width: %s",
    (_code, index) => {
      expect(at(viewImports.length * 2 + index)).toEqual([
        expect.stringContaining("AdaptiveLayout"),
      ]);
    },
  );

  const base = viewImports.length * 2 + widthReads.length;

  it("SHOULD allow the width in a shell allow-listed file", () => {
    expect(at(base)).toEqual([]);
  });

  it("SHOULD allow the width in a legacy allow-listed file", () => {
    expect(at(base + 1)).toEqual([]);
  });

  it("SHOULD keep the screen style rules on allow-listed files", () => {
    expect(at(base + 2)).toEqual([
      expect.stringContaining("Screens do not style"),
    ]);
  });

  it("SHOULD not apply the width rule outside screens", () => {
    expect(at(base + 3)).toEqual([]);
  });
});
