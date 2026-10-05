import { getAvatarTone } from "./getAvatarTone";

it("SHOULD be deterministic for the same name", () => {
  expect(getAvatarTone("Ana")).toBe(getAvatarTone("Ana"));
});

it("SHOULD always return a known tone, also for empty and emoji names", () => {
  const tones = ["accent", "expense", "income", "warning"];

  ["", " ", "Ana", "Zé", "😀", "a".repeat(500)].forEach((name) => {
    expect(tones).toContain(getAvatarTone(name));
  });
});

it("SHOULD spread different names across tones", () => {
  const set = new Set(
    ["Ana", "Bruno", "Carla", "Diego", "Eva", "Fábio"].map(getAvatarTone),
  );

  expect(set.size).toBeGreaterThan(1);
});
