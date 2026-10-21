interface E2eCsvFixture {
  csv: string;
  name: string;
}

// The CSV travels in the URL fragment (`#name=<file name>&csv=<url-encoded text>`), so the dev server never sees it.
function parseE2eCsvFragment(hash: string): E2eCsvFixture | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const csv = params.get("csv");

  if (!csv) {
    return null;
  }

  const name = params.get("name") ?? "";

  return { csv, name: name.length > 0 ? name : "e2e.csv" };
}

export { parseE2eCsvFragment };
export type { E2eCsvFixture };
