// Spec 058: the 16 theme groups of the icon catalog, in display order (same keys as the API's `group`).
const CATEGORY_ICON_GROUPS = [
  "FOOD",
  "HOME",
  "BILLS",
  "TRANSPORT",
  "HEALTH",
  "EDUCATION",
  "LEISURE",
  "SHOPPING",
  "FINANCE",
  "PETS",
  "TRAVEL",
  "WORK",
  "FAMILY",
  "SERVICES",
  "TECH",
  "OTHER",
] as const;

type CategoryIconGroup = (typeof CATEGORY_ICON_GROUPS)[number];

export type { CategoryIconGroup };
export { CATEGORY_ICON_GROUPS };
