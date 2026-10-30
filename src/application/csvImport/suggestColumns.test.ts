import { suggestMapping, suggestTarget } from "./suggestColumns";

describe("spec 048 invoice headers", () => {
  it.each(["Fatura", "invoice", "Mês da fatura", "Invoice month"])(
    "SHOULD suggest Invoice for %s",
    (header) => {
      expect(suggestTarget(header, ["09/2026"])).toBe("invoice");
    },
  );
});

describe("suggestTarget", () => {
  it.each([
    ["Data", "date"],
    ["DATE", "date"],
    ["Descrição", "description"],
    ["historico", "description"],
    ["Memo", "description"],
    ["Categoria", "category"],
    ["Conta", "account"],
    ["Cartão", "card"],
    ["Tipo", "type"],
    ["Pago", "paid"],
    ["Status", "paid"],
    ["Tags", "tags"],
    ["Moeda", "currency"],
    ["Notas", "notes"],
    ["Notes", "notes"],
    ["Observação", "notes"],
    ["Entrada", "incomeAmount"],
    ["Crédito", "incomeAmount"],
    ["Saída", "expenseAmount"],
    ["Débito", "expenseAmount"],
    ["Obs", "ignore"],
  ])("SHOULD suggest %s → %s", (header, expected) => {
    expect(suggestTarget(header, [])).toBe(expected);
  });

  it("SHOULD choose the signed amount WHEN the examples have negatives, else the plain amount", () => {
    expect(suggestTarget("Valor", ["-312,40", "5.200,00"])).toBe(
      "signedAmount",
    );
    expect(suggestTarget("Valor", ["(45,00)"])).toBe("signedAmount");
    expect(suggestTarget("Amount", ["312.40", "5200.00"])).toBe("amount");
  });
});

describe("suggestMapping", () => {
  it("SHOULD recognise every header of an app export in both languages", () => {
    const pt = [
      "Data",
      "Descrição",
      "Tipo",
      "Valor",
      "Moeda",
      "Categoria",
      "Conta",
      "Cartão",
      "Fatura",
      "Pago",
      "Tags",
      "Pertence a",
      "Parcela",
      "Recorrente",
    ];
    const en = [
      "Date",
      "Description",
      "Type",
      "Amount",
      "Currency",
      "Category",
      "Account",
      "Card",
      "Invoice",
      "Paid",
      "Tags",
      "Belongs to",
      "Installment",
      "Recurring",
    ];
    const expected = [
      "date",
      "description",
      "type",
      "amount",
      "currency",
      "category",
      "account",
      "card",
      "invoice",
      "paid",
      "tags",
      "owner",
      "ignore",
      "ignore",
    ];
    const rows = [["02/10/2026", "x", "Despesa", "312,40"]];

    for (const headers of [pt, en]) {
      const mapping = suggestMapping(headers, rows);

      expect(headers.map((_, column) => mapping[column])).toEqual(expected);
    }
  });

  it("SHOULD keep one column per target (the first wins)", () => {
    expect(suggestMapping(["Data", "Data"], [])).toEqual({
      0: "date",
      1: "ignore",
    });
  });

  it("SHOULD drop the single amount columns WHEN income and expense columns both exist", () => {
    const mapping = suggestMapping(
      ["Valor", "Entrada", "Saída"],
      [["1,00", "", "1,00"]],
    );

    expect(mapping).toEqual({
      0: "ignore",
      1: "incomeAmount",
      2: "expenseAmount",
    });
  });

  it("SHOULD ignore a lone Entrada column", () => {
    expect(suggestMapping(["Entrada"], [["1,00"]])).toEqual({ 0: "ignore" });
  });
});
