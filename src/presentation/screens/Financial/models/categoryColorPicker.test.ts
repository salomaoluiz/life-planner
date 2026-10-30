import {
  CATEGORY_COLORS,
  isPaletteColor,
} from "@presentation/constants/categoryColors";

import {
  childColor,
  ColorNode,
  pickRootColor,
  subtreeColors,
  toneSequence,
} from "./categoryColorPicker";

const SLATE = CATEGORY_COLORS[CATEGORY_COLORS.length - 1].value;
const HEX = /^#[0-9A-F]{6}$/;

function near(actual: string, expected: string) {
  const a = actual
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16));
  const e = expected
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16));

  return a.every((value, index) => Math.abs(value - e[index]) <= 1);
}

function node(
  id: string,
  iconColor: string,
  parentId?: string,
  status = "ACTIVE",
): ColorNode {
  return { iconColor, id, parentId, status };
}

describe("palette", () => {
  it("SHOULD have 19 colors including the 7 new ones", () => {
    const values = CATEGORY_COLORS.map((color) => color.value);

    expect(values).toHaveLength(19);
    expect(values).toEqual(
      expect.arrayContaining([
        "#EAB308",
        "#F43F5E",
        "#D946EF",
        "#A855F7",
        "#0EA5E9",
        "#10B981",
        "#A16207",
      ]),
    );
  });
});

describe("pickRootColor", () => {
  it("SHOULD never pick slate", () => {
    for (let index = 0; index < 200; index += 1) {
      expect(pickRootColor([], () => index / 200)).not.toBe(SLATE);
    }
  });

  it("SHOULD return a palette color WHEN nothing is used", () => {
    expect(isPaletteColor(pickRootColor([]))).toBe(true);
  });

  it("SHOULD pick the only color used the fewest times", () => {
    const used = CATEGORY_COLORS.map((color) => color.value).filter(
      (value) => value !== SLATE && value !== "#A855F7",
    );

    expect(pickRootColor(used)).toBe("#A855F7");
  });

  it("SHOULD count used colors ignoring case", () => {
    const used = CATEGORY_COLORS.map((color) => color.value.toLowerCase())
      .filter((value) => value !== SLATE.toLowerCase() && value !== "#a855f7")
      .concat(["#a855f7", "#a855f7"]);

    expect(pickRootColor(used, () => 0)).not.toBe("#A855F7");
  });

  it("SHOULD repeat evenly: after one full round every color is used twice", () => {
    const used: string[] = [];

    for (let index = 0; index < 36; index += 1) {
      used.push(pickRootColor(used, () => 0.5));
    }
    const counts = new Set(
      CATEGORY_COLORS.filter((color) => color.value !== SLATE).map(
        (color) => used.filter((value) => value === color.value).length,
      ),
    );

    expect([...counts]).toEqual([2]);
  });
});

describe("toneSequence", () => {
  it("SHOULD shift lightness -12, +12, -22 for red (design tones)", () => {
    const tones = toneSequence("#EF4444");

    expect(near(tones[0], "#E21313")).toBe(true);
    expect(near(tones[1], "#F47C7C")).toBe(true);
    expect(near(tones[2], "#B30F0F")).toBe(true);
    expect(tones).toHaveLength(6);
    tones.forEach((tone) => expect(tone).toMatch(HEX));
  });

  it("SHOULD treat black and invalid values as #000000 without NaN", () => {
    toneSequence("black").forEach((tone) => expect(tone).toMatch(HEX));
    toneSequence("not-a-color").forEach((tone) => expect(tone).toMatch(HEX));
  });
});

describe("childColor", () => {
  const tones = toneSequence("#EF4444");
  const tree: ColorNode[] = [
    node("red", "#EF4444"),
    node("s1", tones[0], "red"),
    node("s2", tones[0], "red"),
    node("s3", tones[1], "s2"),
    node("s4", tones[0], "red"),
    node("s5", tones[2], "s4"),
  ];

  it("SHOULD give the first child of a root the first tone", () => {
    expect(childColor("red", [node("red", "#EF4444")])).toBe(tones[0]);
  });

  it("SHOULD give siblings the color of the first child", () => {
    expect(childColor("red", tree)).toBe(tones[0]);
  });

  it("SHOULD give the first child of Sub 02 the next unused tone", () => {
    const base = tree.filter((item) => item.id !== "s3" && item.id !== "s5");

    expect(childColor("s2", base)).toBe(tones[1]);
    expect(childColor("s4", [...base, node("s3", tones[1], "s2")])).toBe(
      tones[2],
    );
  });

  it("SHOULD ignore archived children", () => {
    const only = [
      node("red", "#EF4444"),
      node("old", tones[0], "red", "ARCHIVED"),
    ];

    expect(childColor("red", only)).toBe(tones[0]);
    expect(childColor("red", [...only, node("x", tones[0], "red")])).toBe(
      tones[0],
    );
  });

  it("SHOULD return a valid hex for black and custom hex parents", () => {
    expect(childColor("p", [node("p", "#000000")])).toMatch(HEX);
    expect(childColor("p", [node("p", "black")])).toMatch(HEX);
    expect(childColor("p", [node("p", "#123456")])).toMatch(HEX);
  });

  it("SHOULD reuse a tone WHEN the sequence is exhausted", () => {
    const root = node("r", "#EF4444");
    const used = toneSequence("#EF4444").map((tone, index) =>
      node(`g${index}`, tone, index === 0 ? "r" : `g${index - 1}`),
    );
    const result = childColor(`g${used.length - 1}`, [root, ...used]);

    expect(result).toMatch(HEX);
    expect(toneSequence("#EF4444")).toContain(result);
  });
});

describe("subtreeColors (spec 058)", () => {
  const ORANGE = "#F97316";
  function named(
    id: string,
    name: string,
    parentId?: string,
    status = "ACTIVE",
  ): ColorNode {
    return { iconColor: "#6366F1", id, name, parentId, status };
  }
  const food = [
    named("root", "Alimentação"),
    named("padaria", "Padaria", "root", "ARCHIVED"),
    named("mercado", "Mercado", "root"),
    named("restaurante", "Restaurante", "root"),
    named("lanches", "Lanches", "restaurante"),
    named("delivery", "Delivery", "restaurante"),
  ];

  it("SHOULD give the children of one parent one tone and the next group the next tone (spec example)", () => {
    const colors = subtreeColors("root", ORANGE, food);
    const tones = toneSequence(ORANGE);

    expect(colors.has("root")).toBe(false);
    expect(colors.get("mercado")).toBe(colors.get("restaurante"));
    expect(colors.get("padaria")).toBe(colors.get("mercado"));
    expect(colors.get("delivery")).toBe(colors.get("lanches"));
    expect(colors.get("delivery")).not.toBe(colors.get("mercado"));
    expect(tones).toContain(colors.get("mercado"));
    expect(tones).toContain(colors.get("delivery"));
  });

  it("SHOULD color archived-only children too", () => {
    const colors = subtreeColors("root", ORANGE, [
      named("root", "A"),
      named("old", "Old", "root", "ARCHIVED"),
    ]);

    expect(colors.get("old")).toMatch(HEX);
  });

  it("SHOULD derive the tones of a subcategory subtree from the given color and leave siblings and ancestors out", () => {
    const tree = [
      named("root", "A"),
      named("sibling", "S", "root"),
      named("sub", "Sub", "root"),
      named("child", "Child", "sub"),
    ];
    const colors = subtreeColors("sub", ORANGE, tree);

    expect([...colors.keys()]).toEqual(["child"]);
    expect(toneSequence(ORANGE)).toContain(colors.get("child"));
  });

  it("SHOULD reuse the least used tone WHEN there are more groups than tones, deterministically", () => {
    const tree = [named("root", "R")];

    for (let index = 0; index < 8; index += 1) {
      tree.push(
        named(`n${index}`, `N${index}`, index === 0 ? "root" : `n${index - 1}`),
      );
    }
    const first = subtreeColors("root", ORANGE, tree);
    const second = subtreeColors("root", ORANGE, tree);

    expect(first.size).toBe(8);
    expect([...first.entries()]).toEqual([...second.entries()]);
    for (const value of first.values()) {
      expect(toneSequence(ORANGE)).toContain(value);
    }
  });

  it("SHOULD return an empty map for a category without descendants and not mutate the tree", () => {
    const tree = [named("root", "R"), named("b", "B", "root")];
    const before = JSON.stringify(tree);

    expect(subtreeColors("b", ORANGE, tree).size).toBe(0);
    subtreeColors("root", ORANGE, tree);
    expect(JSON.stringify(tree)).toBe(before);
  });

  it("SHOULD not loop on a cycle", () => {
    const colors = subtreeColors("a", ORANGE, [
      named("a", "A", "b"),
      named("b", "B", "a"),
    ]);

    expect([...colors.keys()]).toEqual(["b"]);
  });
});
