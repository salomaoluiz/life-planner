// The fragment of the page URL (web only).
function currentHash(): string {
  return window.location.hash;
}

export { currentHash };
