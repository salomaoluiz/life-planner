// The list screens cache a composed shape ({ categories, owners }, ...) while the forms
// cache the raw use-case output under [uniqueName]. Sharing one key made the forms call
// `.find` on an object (spec 015 FR 1). List queries therefore get their own key.
export function listQueryKey(uniqueName: string): string[] {
  return [uniqueName, "list"];
}
