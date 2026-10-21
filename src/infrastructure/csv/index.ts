import { parse } from "papaparse";

const BOM = 0xfeff;

type CsvEncoding = "UTF-8" | "Windows-1252";

interface DecodedCsv {
  encoding: CsvEncoding;
  text: string;
}

// Windows-1252 differs from Latin-1 only in 0x80-0x9F.
const WINDOWS_1252_HIGH = [
  0x20ac, 0x81, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030,
  0x160, 0x2039, 0x152, 0x8d, 0x17d, 0x8f, 0x90, 0x2018, 0x2019, 0x201c, 0x201d,
  0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x9d, 0x17e,
  0x178,
];

function continuationBytes(first: number): number | undefined {
  if (first < 0x80) {
    return 0;
  }

  if (first >= 0xc2 && first <= 0xdf) {
    return 1;
  }

  if (first >= 0xe0 && first <= 0xef) {
    return 2;
  }

  if (first >= 0xf0 && first <= 0xf4) {
    return 3;
  }

  return undefined;
}

// Removes the BOM; falls back to Windows-1252 when the bytes are not valid UTF-8. `forced` picks the encoding instead
// (the encoding select of the import wizard); bytes that are not valid UTF-8 are still read as Windows-1252.
function decodeCsv(bytes: Uint8Array, forced?: CsvEncoding): DecodedCsv {
  if (forced === "Windows-1252") {
    return { encoding: "Windows-1252", text: decodeWindows1252(bytes) };
  }

  const utf8 = decodeUtf8(bytes);

  if (utf8 !== undefined) {
    return {
      encoding: "UTF-8",
      text: utf8.charCodeAt(0) === BOM ? utf8.slice(1) : utf8,
    };
  }

  return { encoding: "Windows-1252", text: decodeWindows1252(bytes) };
}

// Strict: `undefined` when the bytes are not valid UTF-8 (the caller then reads them as Windows-1252).
function decodeUtf8(bytes: Uint8Array): string | undefined {
  const codePoints: number[] = [];
  let index = 0;

  while (index < bytes.length) {
    const first = bytes[index];
    const extra = continuationBytes(first);

    if (extra === undefined || index + extra >= bytes.length) {
      return undefined;
    }

    let point = extra === 0 ? first : first & (0x3f >> extra);

    for (let offset = 1; offset <= extra; offset += 1) {
      const next = bytes[index + offset];

      if ((next & 0xc0) !== 0x80) {
        return undefined;
      }

      point = (point << 6) | (next & 0x3f);
    }

    codePoints.push(point);
    index += extra + 1;
  }

  return codePoints.map((point) => String.fromCodePoint(point)).join("");
}

function decodeWindows1252(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) =>
    String.fromCodePoint(
      byte >= 0x80 && byte <= 0x9f ? WINDOWS_1252_HIGH[byte - 0x80] : byte,
    ),
  ).join("");
}

// Quoted separators, doubled quotes and line breaks inside quotes are kept; fully empty lines are skipped.
function parseCsv(text: string, separator: string): string[][] {
  const result = parse<string[]>(text, {
    delimiter: separator,
    skipEmptyLines: "greedy",
  });

  return result.data;
}

export type { CsvEncoding, DecodedCsv };
export { decodeCsv, parseCsv };
