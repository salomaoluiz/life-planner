import { CsvSeparator, DateFormat, DecimalSeparator } from "./types";

const SEPARATORS: CsvSeparator[] = [";", ",", "\t"];
const SAMPLE_LINES = 20;

// Counts the separators outside quotes: the number of cells of a line, minus one.
function countSeparators(line: string, separator: string): number {
  let inQuotes = false;
  let count = 0;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      count += 1;
    }
  }

  return count;
}

// FR 10: `dd/mm/yyyy` unless the cells prove otherwise (a first part over 12 is a day, a second one over 12 a month).
function detectDateFormat(samples: string[]): DateFormat {
  let dayFirst = 0;
  let monthFirst = 0;

  for (const sample of samples) {
    const parts = /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/.exec(sample.trim());

    if (!parts) {
      continue;
    }

    if (parts[1].length === 4) {
      return "yyyy-mm-dd";
    }

    if (Number(parts[1]) > 12) {
      dayFirst += 1;
    } else if (Number(parts[2]) > 12) {
      monthFirst += 1;
    }
  }

  return monthFirst > dayFirst ? "mm/dd/yyyy" : "dd/mm/yyyy";
}

// FR 10: from the amount-looking cells. "1.234,56" and "12,5" vote for the comma, "1,234.56" and "-12.5" for the point;
// a lone "1.234" (three digits after the only separator) is a thousands group and does not vote.
function detectDecimal(samples: string[]): DecimalSeparator {
  let comma = 0;
  let point = 0;

  for (const sample of samples) {
    const text = sample.replace(/[^\d.,]/g, "");
    const last = Math.max(text.lastIndexOf(","), text.lastIndexOf("."));

    if (last < 0) {
      continue;
    }

    const separator = text[last];
    const decimals = text.length - last - 1;
    const other = separator === "," ? "." : ",";

    if (decimals === 3 && !text.includes(other)) {
      continue;
    }

    if (separator === ",") {
      comma += 1;
    } else {
      point += 1;
    }
  }

  return point > comma ? "." : ",";
}

// FR 10: the separator that splits the header into the most columns, consistently across the first 20 lines.
function detectSeparator(lines: string[]): CsvSeparator {
  const sample = lines
    .filter((line) => line.trim() !== "")
    .slice(0, SAMPLE_LINES);

  if (sample.length === 0) {
    return ";";
  }

  const scores = SEPARATORS.map((separator) => {
    const counts = sample.map((line) => countSeparators(line, separator));
    const consistent = counts.filter((count) => count === counts[0]).length;

    return { columns: counts[0], consistent, separator };
  }).filter((score) => score.columns > 0);

  if (scores.length === 0) {
    return ",";
  }

  scores.sort((a, b) => b.consistent - a.consistent || b.columns - a.columns);

  return scores[0].separator;
}

export { detectDateFormat, detectDecimal, detectSeparator };
