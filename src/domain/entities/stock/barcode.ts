// Spec 121 FR 5-7: pure rules of a scanned or typed code (the API normalizes again).
const CODE_REGEX = /^[0-9A-Za-z]{1,64}$/;

// Removes spaces and hyphens; `undefined` when what is left is not a code (FR 1).
export function cleanBarcode(raw: string): string | undefined {
  const code = raw.trim().replace(/[\s-]/g, "");

  return CODE_REGEX.test(code) ? code : undefined;
}

// UPC-E (8 digits, system digit 0/1) -> the 12-digit UPC-A it stands for.
export function expandUpcE(code: string): string {
  const [system, d1, d2, d3, d4, d5, d6] = [...code];
  const check = code[7];
  let body: string;

  if (d6 === "0" || d6 === "1" || d6 === "2") {
    body = `${d1}${d2}${d6}0000${d3}${d4}${d5}`;
  } else if (d6 === "3") {
    body = `${d1}${d2}${d3}00000${d4}${d5}`;
  } else if (d6 === "4") {
    body = `${d1}${d2}${d3}${d4}00000${d5}`;
  } else {
    body = `${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }

  return `${system}${body}${check}`;
}

// Spec 121 FR 7: a QR with the stock location link (spec 117) opens the location, nothing else does.
export function locationIdFromLink(
  text: string,
  webBase: string | undefined,
): string | undefined {
  const base = (webBase ?? "").replace(/\/+$/, "");

  if (!base || !text.startsWith(`${base}/stock/locations/`)) {
    return undefined;
  }

  const id = text.slice(`${base}/stock/locations/`.length).split(/[?#/]/)[0];

  return id ? decodeURIComponent(id) : undefined;
}
