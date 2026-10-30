import glyphMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";

import catalog from "./categoryIconCatalog.json";
import { CATEGORY_ICON_GROUPS } from "./categoryIconGroups";
import { ALL_CATEGORY_ICONS } from "./categoryIcons";

// `controller` is a legacy id that the installed glyph map no longer has; it stays in the catalog so saved
// categories keep their icon (the app renders the fallback glyph for it).
const LEGACY_WITHOUT_GLYPH = ["controller"];

it("SHOULD have 16 groups", () => {
  expect(CATEGORY_ICON_GROUPS).toHaveLength(16);
  expect(new Set(CATEGORY_ICON_GROUPS).size).toBe(16);
});

it("SHOULD list at least 180 unique icons including every icon used before spec 058", () => {
  expect(catalog.length).toBeGreaterThanOrEqual(180);
  expect(new Set(catalog).size).toBe(catalog.length);
  for (const name of [...ALL_CATEGORY_ICONS, "shape-outline"]) {
    expect(catalog).toContain(name);
  }
});

it("SHOULD only use names that exist in the MaterialCommunityIcons glyph map", () => {
  const missing = catalog.filter(
    (name) => !(name in glyphMap) && !LEGACY_WITHOUT_GLYPH.includes(name),
  );

  expect(missing).toEqual([]);
});
