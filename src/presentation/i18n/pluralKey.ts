// Keys are typed literals, so plurals are resolved by picking `<key>_one` / `<key>_other`
// at the call site (same convention as family.list.subtitle).
function pluralKey<Base extends string>(
  base: Base,
  count: number,
): `${Base}_one` | `${Base}_other` {
  return count === 1 ? `${base}_one` : `${base}_other`;
}

export default pluralKey;
