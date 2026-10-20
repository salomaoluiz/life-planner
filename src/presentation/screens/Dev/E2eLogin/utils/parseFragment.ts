interface E2eLoginTokens {
  refresh?: string;
  token: string;
}

// The tokens travel in the URL fragment so the dev server never receives or logs them.
function parseE2eLoginFragment(hash: string): E2eLoginTokens | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const token = params.get("token");
  if (!token) {
    return null;
  }
  const refresh = params.get("refresh");
  return {
    refresh: refresh === "" ? undefined : (refresh ?? undefined),
    token,
  };
}

export { parseE2eLoginFragment };
export type { E2eLoginTokens };
