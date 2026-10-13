function buildInviteLink(baseUrl: string | undefined, token: string): string {
  const base = (baseUrl ?? "").replace(/\/+$/, "");

  return `${base}/invite?token=${encodeURIComponent(token)}`;
}

// Keeps the start (host) and the end (token tail) readable in one line.
function truncateMiddle(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }

  const keep = max - 1;
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);

  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

export { buildInviteLink, truncateMiddle };
