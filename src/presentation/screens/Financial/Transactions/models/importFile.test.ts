import { headerKey, MAX_FILE_BYTES, readImportFile } from "./importFile";

function pick(text: string) {
  const bytes = new TextEncoder().encode(text);

  return { bytes, name: "extrato.csv", size: bytes.length };
}

describe("readImportFile", () => {
  it("SHOULD detect the separator, decimal comma and day-first date of a Brazilian statement", () => {
    const parsed = readImportFile(
      pick(
        "Data;Histórico;Valor\r\n02/10/2026;Supermercado;-312,40\r\n13/10/2026;Salário;5.200,00\r\n",
      ),
    );

    expect(parsed).toMatchObject({
      dateFormat: "dd/mm/yyyy",
      decimal: ",",
      encoding: "UTF-8",
      separator: ";",
    });
    expect(parsed.problem).toBeUndefined();
    expect(parsed.table).toHaveLength(3);
    expect(parsed.table[0]).toEqual(["Data", "Histórico", "Valor"]);
  });

  it("SHOULD detect an international file (comma, point, ISO dates)", () => {
    const parsed = readImportFile(
      pick("Date,Amount\n2026-10-02,-312.40\n2026-10-03,5200.00\n"),
    );

    expect(parsed).toMatchObject({
      dateFormat: "yyyy-mm-dd",
      decimal: ".",
      separator: ",",
    });
  });

  it("SHOULD strip a BOM so the first header is clean", () => {
    const bytes = new Uint8Array([
      0xef,
      0xbb,
      0xbf,
      ...new TextEncoder().encode("Data;Valor\n02/10/2026;1,00\n"),
    ]);

    expect(
      readImportFile({ bytes, name: "a.csv", size: bytes.length }).table[0],
    ).toEqual(["Data", "Valor"]);
  });

  it("SHOULD read Windows-1252 bytes and let the encoding be forced", () => {
    const bytes = new Uint8Array([
      ...new TextEncoder().encode("Data;Hist"),
      0xf3,
      ...new TextEncoder().encode("rico\n02/10/2026;x\n"),
    ]);
    const file = { bytes, name: "a.csv", size: bytes.length };

    expect(readImportFile(file).encoding).toBe("Windows-1252");
    expect(readImportFile(file).table[0][1]).toBe("Histórico");
  });

  it("SHOULD let every detected option be overridden", () => {
    const parsed = readImportFile(pick("a,b\n1,2\n"), {
      dateFormat: "mm/dd/yyyy",
      decimal: ".",
      separator: ";",
    });

    expect(parsed).toMatchObject({
      dateFormat: "mm/dd/yyyy",
      decimal: ".",
      separator: ";",
    });
    expect(parsed.table[0]).toEqual(["a,b"]);
  });

  it.each([
    ["", "EMPTY"],
    ["Data;Valor\n", "EMPTY"],
    ["Data;Valor", "EMPTY"],
  ])("SHOULD report %j as %s (no transactions)", (text, problem) => {
    expect(readImportFile(pick(text)).problem).toBe(problem);
  });

  it("SHOULD refuse more than 2,000 rows", () => {
    const rows = Array.from({ length: 2001 }, () => "02/10/2026;x;1,00");

    expect(
      readImportFile(pick(`Data;Desc;Valor\n${rows.join("\n")}`)).problem,
    ).toBe("TOO_MANY_ROWS");
    expect(
      readImportFile(pick(`Data;Desc;Valor\n${rows.slice(1).join("\n")}`))
        .problem,
    ).toBeUndefined();
  });

  it("SHOULD refuse a file over 2 MB without reading it", () => {
    const parsed = readImportFile({
      bytes: new Uint8Array(1),
      name: "big.csv",
      size: MAX_FILE_BYTES + 1,
    });

    expect(parsed.problem).toBe("TOO_LARGE");
    expect(parsed.table).toEqual([]);
  });
});

describe("headerKey", () => {
  it("SHOULD be the same for the same headers whatever the case or the spaces", () => {
    expect(headerKey([["Data", " Valor "]])).toBe(
      headerKey([["data", "valor"]]),
    );
    expect(headerKey([["Data", "Valor"]])).not.toBe(headerKey([["Data"]]));
    expect(headerKey([])).toBe("");
  });
});
