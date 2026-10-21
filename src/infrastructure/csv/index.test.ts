import { decodeCsv, parseCsv } from "./";

describe("parseCsv", () => {
  it("SHOULD keep a quoted separator, a doubled quote and a line break inside a cell", () => {
    const text = 'a;b\r\n"x;y";"say ""hi"""\r\n"two\nlines";z\r\n';

    expect(parseCsv(text, ";")).toEqual([
      ["a", "b"],
      ["x;y", 'say "hi"'],
      ["two\nlines", "z"],
    ]);
  });

  it("SHOULD skip blank lines, including the trailing one", () => {
    expect(parseCsv("a,b\n\n1,2\n\n", ",")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("SHOULD return only the header for a file with just a header line", () => {
    expect(parseCsv("Data;Valor", ";")).toEqual([["Data", "Valor"]]);
  });
});

describe("decodeCsv", () => {
  it("SHOULD strip the BOM so the first header is clean", () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x44, 0x61, 0x74, 0x61]);

    expect(decodeCsv(bytes)).toEqual({ encoding: "UTF-8", text: "Data" });
  });

  it("SHOULD read multi-byte UTF-8", () => {
    const bytes = new Uint8Array([
      0x43, 0x61, 0x66, 0xc3, 0xa9, 0x20, 0xe2, 0x82, 0xac,
    ]);

    expect(decodeCsv(bytes)).toEqual({ encoding: "UTF-8", text: "Café €" });
  });

  it("SHOULD fall back to Windows-1252 when the bytes are not valid UTF-8", () => {
    const bytes = new Uint8Array([0x43, 0x61, 0x66, 0xe9, 0x20, 0x80]);

    expect(decodeCsv(bytes)).toEqual({
      encoding: "Windows-1252",
      text: "Café €",
    });
  });

  it("SHOULD read the bytes as Windows-1252 WHEN that encoding is forced", () => {
    const bytes = new Uint8Array([0x43, 0x61, 0x66, 0xc3, 0xa9]);

    // UTF-8 bytes read as Windows-1252 show as two characters: the user picks the right one in the select.
    expect(decodeCsv(bytes, "Windows-1252")).toEqual({
      encoding: "Windows-1252",
      text: "CafÃ©",
    });
    expect(decodeCsv(bytes, "UTF-8")).toEqual({
      encoding: "UTF-8",
      text: "Café",
    });
  });

  it("SHOULD treat a truncated multi-byte sequence as not UTF-8", () => {
    expect(decodeCsv(new Uint8Array([0x61, 0xc3])).encoding).toBe(
      "Windows-1252",
    );
  });
});
