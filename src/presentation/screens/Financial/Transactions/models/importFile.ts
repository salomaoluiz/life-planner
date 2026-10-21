import {
  detectDateFormat,
  detectDecimal,
  detectSeparator,
} from "@application/csvImport/detect";
import { suggestMapping } from "@application/csvImport/suggestColumns";
import {
  ColumnTarget,
  CsvSeparator,
  DateFormat,
  DecimalSeparator,
} from "@application/csvImport/types";
import { CsvEncoding, decodeCsv, parseCsv } from "@infrastructure/csv";

// Spec 047 FR 9.
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_FILE_ROWS = 2000;
const AMOUNT_TARGETS: ColumnTarget[] = [
  "amount",
  "expenseAmount",
  "incomeAmount",
  "signedAmount",
];
const SAMPLE_ROWS = 50;

type FileProblem = "EMPTY" | "TOO_LARGE" | "TOO_MANY_ROWS";

interface ParsedCsv {
  dateFormat: DateFormat;
  decimal: DecimalSeparator;
  encoding: CsvEncoding;
  file: PickedCsv;
  problem?: FileProblem;
  separator: CsvSeparator;
  // The header line first, then the data rows.
  table: string[][];
}

// What the select of each detection option can override.
interface ParseOverrides {
  dateFormat?: DateFormat;
  decimal?: DecimalSeparator;
  encoding?: CsvEncoding;
  separator?: CsvSeparator;
}

interface PickedCsv {
  bytes: Uint8Array;
  name: string;
  size: number;
}

// The cells the detections read: the date column and the amount columns, from the header suggestions (else every cell).
function detectionSamples(table: string[][]) {
  const [headers = [], ...rows] = table;
  const sample = rows.slice(0, SAMPLE_ROWS);
  const mapping = suggestMapping(headers, sample);
  function column(accept: (target: ColumnTarget) => boolean) {
    return sample.flatMap((row) =>
      headers.flatMap((_, index) =>
        accept(mapping[index]) ? [row[index] ?? ""] : [],
      ),
    );
  }
  const everyCell = sample.flat();
  const dates = column((target) => target === "date");
  const amounts = column((target) => AMOUNT_TARGETS.includes(target));

  return {
    amounts: amounts.length > 0 ? amounts : everyCell,
    dates: dates.length > 0 ? dates : everyCell,
  };
}

// A key of the header line: the mappings are kept when a new file has the same headers (FR 31).
function headerKey(table: string[][]): string {
  return (table[0] ?? [])
    .map((header) => header.trim().toLowerCase())
    .join("|");
}

function problemOf(rowCount: number): FileProblem | undefined {
  if (rowCount === 0) {
    return "EMPTY";
  }

  return rowCount > MAX_FILE_ROWS ? "TOO_MANY_ROWS" : undefined;
}

// FR 10: separator, decimal, date format and encoding are detected, each editable (an override wins over detection).
function readImportFile(
  file: PickedCsv,
  overrides: ParseOverrides = {},
): ParsedCsv {
  const empty: ParsedCsv = {
    dateFormat: overrides.dateFormat ?? "dd/mm/yyyy",
    decimal: overrides.decimal ?? ",",
    encoding: overrides.encoding ?? "UTF-8",
    file,
    separator: overrides.separator ?? ";",
    table: [],
  };

  if (file.size > MAX_FILE_BYTES) {
    return { ...empty, problem: "TOO_LARGE" };
  }

  const { encoding, text } = decodeCsv(file.bytes, overrides.encoding);
  const separator = overrides.separator ?? detectSeparator(text.split(/\r?\n/));
  const table = parseCsv(text, separator);
  const rows = table.slice(1);
  const problem = problemOf(rows.length);
  const samples = detectionSamples(table);

  return {
    dateFormat: overrides.dateFormat ?? detectDateFormat(samples.dates),
    decimal: overrides.decimal ?? detectDecimal(samples.amounts),
    encoding,
    file,
    problem,
    separator,
    table,
  };
}

export type { FileProblem, ParsedCsv, ParseOverrides, PickedCsv };
export { headerKey, MAX_FILE_BYTES, MAX_FILE_ROWS, readImportFile };
