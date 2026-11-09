import {
  bundleSyntaxSelectors,
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

// Spec 099 FR 13: the width decision belongs to AdaptiveLayout (and the kit), not to screen code.
// PERMANENT: navigation shells that pick their own frame.
export const shellBreakpointAllowList = [
  "src/presentation/screens/Financial/Layout/**",
  "src/presentation/screens/Navigation/containers/AppTabBar/**",
];

// TEMPORARY: files that already hold phone rules inside the wide View. Spec 100 refines it
// ("Compaction already in the wide View"); each compact spec removes its entries.
export const legacyCompactionAllowList = [
  "src/presentation/screens/Config/modals/Versions/components/ChangesList.tsx",
  "src/presentation/screens/Config/modals/Versions/views/Wide.tsx",
  "src/presentation/screens/Financial/Accounts/views/Wide.tsx",
  "src/presentation/screens/Financial/Categories/modals/NewCategoryModal/views/Wide.tsx",
  "src/presentation/screens/Financial/ConfirmPayment/index.tsx",
  "src/presentation/screens/Financial/Overview/components/CategoriesBlock.tsx",
  "src/presentation/screens/Financial/Overview/components/CustomPeriodSheet.tsx",
  "src/presentation/screens/Financial/Overview/components/OverviewToolbar.tsx",
  "src/presentation/screens/Financial/Overview/components/TagsBlock.tsx",
  "src/presentation/screens/Financial/Overview/views/Wide.tsx",
  "src/presentation/screens/Financial/Transactions/components/FilterToolbar/index.tsx",
  "src/presentation/screens/Financial/Transactions/index.tsx",
  "src/presentation/screens/Financial/Transactions/modals/ExportModal/useExportModalViewModel.ts",
  "src/presentation/screens/Financial/Transactions/modals/FiltersModal/useFiltersModalViewModel.ts",
  "src/presentation/screens/Financial/Transactions/modals/ImportWizard/useImportWizardViewModel.ts",
  "src/presentation/screens/Financial/Transactions/modals/NewTransactionModal/index.tsx",
  "src/presentation/screens/Financial/Transactions/modals/TransferForm/index.tsx",
  "src/presentation/screens/Home/components/UpcomingList/index.tsx",
  "src/presentation/screens/Home/hooks/useHomeViewModel.ts",
  "src/presentation/screens/Stock/modals/NewStockItemModal/hooks/useNewStockItemViewModel.ts",
  "src/presentation/screens/Stock/modals/NewStockItemModal/styles.ts",
];

// Files allowed to contain color literals (stored user data). Plan 013 appends
// "src/presentation/constants/categoryColors.ts" with the comment "stored category colors are user data (spec 013)".
export const colorLiteralIgnores = [
  "src/presentation/theme/constants/**",
  // stored category colors are user data (spec 013)
  "src/presentation/constants/categoryColors.ts",
  // stored card colors are user data (spec 026)
  "src/presentation/constants/cardColors.ts",
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

const breakpointSelectors = [
  "CallExpression[callee.name=/^(useBreakpoint|useWindowDimensions)$/]",
  "MemberExpression[property.name='breakpoint']",
  "ObjectPattern > Property[key.name='breakpoint']",
].map((selector) => ({
  message:
    "Screens do not read the width: AdaptiveLayout picks the View (views/Wide.tsx, views/Compact.tsx) (spec 099).",
  selector,
}));

const viewForbiddenImports = [
  {
    group: ["@application/useCases", "@application/useCases/*"],
    message: "Views read data through `vm`, never use cases (spec 099).",
  },
  {
    group: ["@infrastructure/*"],
    message: "Views read data through `vm`, never @infrastructure (spec 099).",
  },
  {
    group: ["expo-router", "@react-navigation/*"],
    message:
      "Navigation belongs to the ViewModel; Views get handlers through `vm` (spec 099).",
  },
  {
    group: ["**/use*ViewModel"],
    message:
      "Only the screen entry (index.tsx) calls the ViewModel (spec 099).",
  },
];

const screenFiles = "src/presentation/screens/**/*.{ts,tsx}";
const baseScreenSelectors = [
  ...colorLiteralSelectors,
  ...screenStyleSelectors,
  ...bundleSyntaxSelectors,
];
const noStyleSelectors = [...colorLiteralSelectors, ...bundleSyntaxSelectors];
const breakpointAllowList = [
  ...shellBreakpointAllowList,
  ...legacyCompactionAllowList,
];

export default [
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    ignores: [...colorLiteralIgnores, ...testsAndMocks],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...colorLiteralSelectors,
        ...bundleSyntaxSelectors,
      ],
    },
  },
  {
    files: [screenFiles],
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
    },
  },
  // no-restricted-syntax is replaced (not merged) by a later block, so each file
  // group gets exactly one block with its complete selector list.
  {
    files: [screenFiles],
    ignores: [...migrationAllowList, ...breakpointAllowList, ...testsAndMocks],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...baseScreenSelectors,
        ...breakpointSelectors,
      ],
    },
  },
  {
    files: breakpointAllowList,
    ignores: [...migrationAllowList, ...testsAndMocks],
    rules: { "no-restricted-syntax": ["error", ...baseScreenSelectors] },
  },
  {
    files: migrationAllowList,
    ignores: [...breakpointAllowList, ...testsAndMocks],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...noStyleSelectors,
        ...breakpointSelectors,
      ],
    },
  },
  {
    files: ["src/presentation/screens/**/views/**/*.{ts,tsx}"],
    ignores: testsAndMocks,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [...restrictedPatterns, ...viewForbiddenImports],
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
    },
  },
];
