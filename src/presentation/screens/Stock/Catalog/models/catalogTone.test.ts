import { toneSequence } from "@screens/Financial/models/categoryColorPicker";

import {
  cascadeColors,
  compareNames,
  newChildTone,
  siblingTone,
  ToneNode,
} from "./catalogTone";

const ROOT = "#3B82F6";

function node(
  id: string,
  name: string,
  children: ToneNode[] = [],
  status = "ACTIVE",
): ToneNode {
  return { children, id, name, status };
}

describe("siblingTone", () => {
  it("SHOULD take the tone step of the position and wrap after six", () => {
    const tones = toneSequence(ROOT);

    expect(siblingTone(ROOT, 0)).toBe(tones[0]);
    expect(siblingTone(ROOT, 2)).toBe(tones[2]);
    expect(siblingTone(ROOT, 6)).toBe(tones[0]);
  });
});

describe("newChildTone", () => {
  it("SHOULD use the alphabetical position among the siblings", () => {
    const tones = toneSequence(ROOT);

    expect(newChildTone(ROOT, [], "Zebra")).toBe(tones[0]);
    expect(newChildTone(ROOT, ["Árvore", "Banana"], "Cenoura")).toBe(tones[2]);
    expect(newChildTone(ROOT, ["Banana"], "abacate")).toBe(tones[0]);
  });
});

describe("cascadeColors", () => {
  it("SHOULD tone every active descendant by sibling position and skip archived ones", () => {
    const tones = toneSequence(ROOT);
    const tree = node("root", "Root", [
      node("b", "B", [node("b1", "B1")]),
      node("a", "A"),
      node("old", "Old", [], "ARCHIVED"),
    ]);

    expect(cascadeColors(ROOT, tree)).toEqual({
      a: tones[0],
      b: tones[1],
      b1: tones[0],
    });
  });
});

it("SHOULD compare names ignoring case and accents", () => {
  expect(compareNames("água", "Agua")).toBe(0);
  expect(compareNames("Banana", "abacate")).toBeGreaterThan(0);
});
