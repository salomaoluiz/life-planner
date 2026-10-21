import { ColumnMapping, ColumnTarget } from "./types";

// FR 14: header words (accent- and case-insensitive, both languages). The headers of an app export are all here.
const HEADER_TARGETS: [ColumnTarget, string[]][] = [
  ["date", ["data", "date", "dia", "day"]],
  [
    "description",
    [
      "descricao",
      "description",
      "historico",
      "memo",
      "estabelecimento",
      "lancamento",
      "detalhes",
      "details",
    ],
  ],
  ["category", ["categoria", "category"]],
  ["account", ["conta", "account"]],
  ["card", ["cartao", "card", "cartao de credito", "credit card"]],
  ["type", ["tipo", "type"]],
  ["paid", ["pago", "paid", "status", "situacao"]],
  ["tags", ["tags", "etiquetas", "marcadores"]],
  ["currency", ["moeda", "currency"]],
  ["incomeAmount", ["entrada", "credito", "receita", "income", "credit"]],
  ["expenseAmount", ["saida", "debito", "despesa", "expense", "debit"]],
  [
    "ignore",
    [
      "fatura",
      "invoice",
      "pertence a",
      "belongs to",
      "parcela",
      "installment",
      "recorrente",
      "recurring",
    ],
  ],
];
const AMOUNT_WORDS = ["valor", "amount", "value", "quantia"];

function dropTargets(
  mapping: ColumnMapping,
  targets: ColumnTarget[],
): ColumnMapping {
  return Object.fromEntries(
    Object.entries(mapping).map(([column, target]) => [
      column,
      targets.includes(target) ? "ignore" : target,
    ]),
  );
}

// Lowercase, no accents, single spaces: the form headers and words are compared in.
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// One suggestion per column; a target can be on one column only (the first wins) and an income/expense pair
// replaces a single amount column (FR 15, 16).
function suggestMapping(headers: string[], rows: string[][]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<ColumnTarget>();

  headers.forEach((header, column) => {
    const examples = rows.slice(0, 20).map((row) => row[column] ?? "");
    const target = suggestTarget(header, examples);

    if (target !== "ignore" && used.has(target)) {
      mapping[column] = "ignore";

      return;
    }

    used.add(target);
    mapping[column] = target;
  });

  if (used.has("incomeAmount") && used.has("expenseAmount")) {
    return dropTargets(mapping, ["amount", "signedAmount"]);
  }

  // A lone "entrada"/"saida" is not an amount pair.
  if (used.has("incomeAmount") !== used.has("expenseAmount")) {
    return dropTargets(mapping, ["incomeAmount", "expenseAmount"]);
  }

  return mapping;
}

function suggestTarget(header: string, examples: string[]): ColumnTarget {
  const name = normalizeText(header);

  if (AMOUNT_WORDS.includes(name)) {
    return examples.some((example) => /^\s*[-−(]/.test(example))
      ? "signedAmount"
      : "amount";
  }

  const found = HEADER_TARGETS.find(([, words]) => words.includes(name));

  return found ? found[0] : "ignore";
}

export { normalizeText, suggestMapping, suggestTarget };
