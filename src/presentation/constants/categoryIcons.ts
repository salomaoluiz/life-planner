const ALL_CATEGORY_ICONS = [
  "folder",
  "food",
  "car",
  "home",
  "medical-bag",
  "school",
  "airplane",
  "gift",
  "cart",
  "bank",
  "cash",
  "credit-card",
  "water",
  "lightning-bolt",
  "wifi",
  "controller",
  "dumbbell",
  "heart",
];
const COMMON_CATEGORY_ICONS = ALL_CATEGORY_ICONS.slice(0, 12);

function filterIcons(names: string[], query: string) {
  const needle = query.trim().toLowerCase();

  return needle
    ? names.filter((name) => iconLabel(name).includes(needle))
    : names;
}

// Icon names are technical ids; the spoken label is the id with spaces.
function iconLabel(name: string) {
  return name.replace(/-/g, " ");
}

export { ALL_CATEGORY_ICONS, COMMON_CATEGORY_ICONS, filterIcons, iconLabel };
