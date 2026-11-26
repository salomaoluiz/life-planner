import { toneSequence } from "@screens/Financial/models/categoryColorPicker";

interface ToneNode {
  children: ToneNode[];
  id: string;
  name: string;
  status: string;
}

// FR 12: the tones of every ACTIVE descendant of `parent`, computed top-down by sibling position.
function cascadeColors(
  rootColor: string,
  parent: ToneNode,
): Record<string, string> {
  const colors: Record<string, string> = {};
  const active = [...parent.children]
    .filter((child) => child.status === "ACTIVE")
    .sort((a, b) => compareNames(a.name, b.name));

  active.forEach((child, index) => {
    colors[child.id] = siblingTone(rootColor, index);
    Object.assign(colors, cascadeColors(rootColor, child));
  });

  return colors;
}

// Alphabetical, case- and accent-insensitive (FR 5).
function compareNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

// The color of a NEW child named `name` among the active `siblingNames` of its parent.
function newChildTone(
  rootColor: string,
  siblingNames: string[],
  name: string,
): string {
  const before = siblingNames.filter(
    (sibling) => compareNames(sibling, name) < 0,
  ).length;

  return siblingTone(rootColor, before);
}

// Spec 125 FR 11: the tone of a child is the root color shifted by the 054 tone steps, picked by its alphabetical
// position among the active siblings (1st sibling = step 1, wrapping).
function siblingTone(rootColor: string, position: number): string {
  const tones = toneSequence(rootColor);

  return tones[position % tones.length];
}

export type { ToneNode };
export { cascadeColors, compareNames, newChildTone, siblingTone };
