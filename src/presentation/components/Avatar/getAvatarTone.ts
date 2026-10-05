const TONES = ["accent", "income", "warning", "expense"] as const;

export function getAvatarTone(name: string): (typeof TONES)[number] {
  const sum = Array.from(name.trim()).reduce(
    (total, char) => total + (char.codePointAt(0) ?? 0),
    0,
  );

  return TONES[sum % TONES.length];
}
