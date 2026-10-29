import {
  CATEGORY_COLORS,
  isPaletteColor,
} from "@presentation/constants/categoryColors";

import {
  childColor,
  ColorNode,
  pickRootColor,
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
