import { ensureContrast, parseColor } from "@components/IconTile/contrast";
import { CATEGORY_COLORS } from "@presentation/constants/categoryColors";
import { colors } from "@presentation/theme/constants";

interface ColorNode {
  iconColor: string;
  id: string;
  // Only used to order siblings in `subtreeColors` (tree order = name order inside each level).
  name?: string;
  parentId?: string;
  status?: string;
}

interface Hsl {
  h: number;
  l: number;
  s: number;
}

const SLATE_KEY = "financial.colors.slate";
// Spec 054 FR 13: lightness shifts, in points, of the tones of a root color.
const TONE_SHIFTS = [-12, 12, -22, 22, -30, 30];
const MIN_LIGHTNESS = 20;
const MAX_LIGHTNESS = 80;
// Two colors closer than this (RGB distance), once adjusted for contrast in a theme, look the same.
const MIN_TONE_DISTANCE = 24;

// Spec 054 FR 13: children of one parent share a tone; the first child of a parent gets a tone of its root that is not
// used yet in the root's tree.
function childColor(parentId: string, tree: ColorNode[]): string {
  const byId = new Map(tree.map((item) => [item.id, item]));
  const firstChild = tree.find(
    (item) => item.parentId === parentId && isActive(item),
  );

  if (firstChild) {
    return firstChild.iconColor.toUpperCase();
  }
  const root = rootOf(parentId, byId);

  if (!root) {
    return pickRootColor([]);
  }
  const inTree = new Set<string>([root.id]);
  let grew = true;

  while (grew) {
    grew = false;
    for (const item of tree) {
      if (item.parentId && inTree.has(item.parentId) && !inTree.has(item.id)) {
        inTree.add(item.id);
        grew = true;
      }
    }
  }
  const members = tree.filter((item) => inTree.has(item.id) && isActive(item));
  const tones = toneSequence(root.iconColor);
  const fresh = tones.find(
    (tone) =>
      !looksSame(tone, root.iconColor) &&
      !members.some((item) => looksSame(tone, item.iconColor)),
  );

  if (fresh) {
    return fresh;
  }
  // Exhausted: the tone used by the fewest groups (a group = children of one parent).
  function groups(tone: string) {
    return new Set(
      members
        .filter((item) => item.parentId && sameColor(item.iconColor, tone))
        .map((item) => item.parentId),
    ).size;
  }

  return tones.reduce((best, tone) =>
    groups(tone) < groups(best) ? tone : best,
  );
}

function distance(a: string, b: string) {
  const first = parseColor(a);
  const second = parseColor(b);

  if (!first || !second) {
    return Infinity;
  }

  return Math.sqrt(
    (first.r - second.r) ** 2 +
      (first.g - second.g) ** 2 +
      (first.b - second.b) ** 2,
  );
}

function fromHsl({ h, l, s }: Hsl): string {
  const lightness = l / 100;
  const saturation = s / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  const sector = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [chroma, x, 0],
    [x, chroma, 0],
    [0, chroma, x],
    [0, x, chroma],
    [x, 0, chroma],
    [chroma, 0, x],
  ][sector];

  return `#${[r, g, b]
    .map((value) =>
      Math.round((value + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}

function isActive(node: ColorNode) {
  return node.status !== "ARCHIVED";
}

// Looks the same as another color in at least one theme, after the contrast adjustment the app applies when showing it.
function looksSame(a: string, b: string) {
  return (["light", "dark"] as const).some(
    (theme) =>
      distance(shownIn(a, theme), shownIn(b, theme)) < MIN_TONE_DISTANCE,
  );
}

// Spec 054 FR 12: random among the palette colors (slate out) used the fewest times by the owner's active roots.
function pickRootColor(
  usedColors: string[],
  random: () => number = Math.random,
): string {
  const candidates = CATEGORY_COLORS.filter(
    (item) => item.labelKey !== SLATE_KEY,
  ).map((item) => item.value);
  function count(value: string) {
    return usedColors.filter((used) => sameColor(used, value)).length;
  }
  const fewest = Math.min(...candidates.map(count));
  const pool = candidates.filter((value) => count(value) === fewest);

  return pool[Math.min(Math.floor(random() * pool.length), pool.length - 1)];
}

// The color of the root of the tree a category belongs to (itself when it is a root).
function rootColorOf(id: string, tree: ColorNode[]): string | undefined {
  return rootOf(id, new Map(tree.map((item) => [item.id, item])))?.iconColor;
}

function rootOf(
  id: string,
  byId: Map<string, ColorNode>,
): ColorNode | undefined {
  let current = byId.get(id);
  const seen = new Set<string>();

  while (
    current?.parentId &&
    byId.has(current.parentId) &&
    !seen.has(current.id)
  ) {
    seen.add(current.id);
    current = byId.get(current.parentId);
  }

  return current;
}

function sameColor(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function shownIn(color: string, theme: "dark" | "light") {
  const palette = colors[theme];

  return ensureContrast(color, palette.surface, palette.textPrimary);
}

// Spec 058 FR 4: recolors a whole subtree top-down as if it were created again in tree order. Children of one parent
// share one tone; each group of children takes the next tone of `rootColor` not used yet (archived included). The root
// itself is not in the result.
function subtreeColors(
  rootId: string,
  rootColor: string,
  tree: ColorNode[],
): Map<string, string> {
  const childrenOf = new Map<string, ColorNode[]>();

  for (const item of tree) {
    if (item.parentId) {
      childrenOf.set(item.parentId, [
        ...(childrenOf.get(item.parentId) ?? []),
        item,
      ]);
    }
  }
  for (const children of childrenOf.values()) {
    children.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }
  const tones = toneSequence(rootColor);
  const result = new Map<string, string>();
  const groupTones: string[] = [];
  const seen = new Set<string>([rootId]);

  function nextTone() {
    const fresh = tones.find(
      (tone) =>
        !looksSame(tone, rootColor) &&
        !groupTones.some((used) => looksSame(tone, used)),
    );

    if (fresh) {
      return fresh;
    }
    function uses(tone: string) {
      return groupTones.filter((used) => sameColor(used, tone)).length;
    }

    return tones.reduce((best, tone) =>
      uses(tone) < uses(best) ? tone : best,
    );
  }

  function visit(parentId: string) {
    const children = (childrenOf.get(parentId) ?? []).filter(
      (child) => !seen.has(child.id),
    );

    if (children.length === 0) {
      return;
    }
    const tone = nextTone();

    groupTones.push(tone);
    for (const child of children) {
      seen.add(child.id);
      result.set(child.id, tone);
    }
    for (const child of children) {
      visit(child.id);
    }
  }

  visit(rootId);

  return result;
}

function toHsl(color: string): Hsl {
  const rgb = parseColor(color) ?? { b: 0, g: 0, r: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, l: l * 100, s: 0 };
  }
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;

  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  return { h: (h * 60 + 360) % 360, l: l * 100, s: s * 100 };
}

// The six tones of a root color: same hue and saturation, lightness shifted (spec 054 FR 13).
function toneSequence(rootColor: string): string[] {
  const base = toHsl(rootColor);

  return TONE_SHIFTS.map((shift) =>
    fromHsl({
      ...base,
      l: Math.min(MAX_LIGHTNESS, Math.max(MIN_LIGHTNESS, base.l + shift)),
    }),
  );
}

export type { ColorNode };
export { childColor, pickRootColor, rootColorOf, subtreeColors, toneSequence };
