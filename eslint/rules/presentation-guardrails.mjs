import {
  restrictedPatterns,
  restrictedPaths,
} from "./no-restricted-imports.mjs";

// TEMPORARY (spec 008 FR 39): screen folders not yet migrated to the kit.
// Each of specs 010-014 removes its folders; 014 deletes this list.
export const migrationAllowList = [
  "src/presentation/screens/Config/**",
  "src/presentation/screens/Feedback/**",
  "src/presentation/screens/Login/**",
  "src/presentation/screens/Signup/**",
  "src/presentation/screens/index.tsx",
];

// Files allowed to contain color literals (stored user data). Plan 013 appends
// "src/presentation/constants/categoryColors.ts" with the comment "stored category colors are user data (spec 013)".
export const colorLiteralIgnores = [
  "src/presentation/theme/constants/**",
  // stored category colors are user data (spec 013)
  "src/presentation/constants/categoryColors.ts",
];

const testsAndMocks = [
  "**/*.test.{ts,tsx}",
  "**/mocks/**",
  "**/*.mocks.{ts,tsx}",
  "**/*.fixture.{ts,tsx}",
];

const kitOnly =
  "Use the component kit (@components); wrap third-party UI in src/presentation/components first.";

const forbiddenScreenStyleProps = [
  "color",
  "backgroundColor",
  "borderColor",
  "fontSize",
  "fontFamily",
  "fontWeight",
  "lineHeight",
  "borderRadius",
  "elevation",
];

const colorLiteralSelectors = [
  "Literal[value=/^#[0-9a-f]{3,8}$/i]",
  "Literal[value=/^rgba?\\(/i]",
  "Literal[value=/^hsla?\\(/i]",
].map((selector) => ({
  message:
    "No color literals: read colors from the theme tokens (useKitTheme / useTheme).",
  selector,
}));

const screenStyleSelectors = [
  ...forbiddenScreenStyleProps.map((name) => `Property[key.name='${name}']`),
  "Property[key.name=/^shadow/]",
].map((selector) => ({
  message:
    "Screens do not style visual details: compose kit components (layout props only).",
  selector,
}));

export default [
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    ignores: [...colorLiteralIgnores, ...testsAndMocks],
    rules: { "no-restricted-syntax": ["error", ...colorLiteralSelectors] },
  },
  {
    files: ["src/presentation/screens/**/*.{ts,tsx}"],
    ignores: [...migrationAllowList, ...testsAndMocks],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: restrictedPatterns,
          paths: [
            ...restrictedPaths,
            { message: kitOnly, name: "react-native-paper" },
            { message: kitOnly, name: "react-native-paper-dates" },
            { message: kitOnly, name: "expo-blur" },
            { message: kitOnly, name: "@expo/vector-icons" },
            { message: kitOnly, name: "@react-native-picker/picker" },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        ...colorLiteralSelectors,
        ...screenStyleSelectors,
      ],
    },
  },
];
