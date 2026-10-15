// "#RRGGBB" + alpha (0..1) -> "#RRGGBBAA". Anything that is not a 7-char hex is returned unchanged.
function withAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex;
  }

  const clamped = Math.min(1, Math.max(0, alpha));

  return `${hex}${Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

export default withAlpha;
