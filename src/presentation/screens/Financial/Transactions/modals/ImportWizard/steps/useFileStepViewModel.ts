import { useState } from "react";

import {
  CsvSeparator,
  DateFormat,
  DecimalSeparator,
} from "@application/csvImport/types";
import { CsvEncoding } from "@infrastructure/csv";
import { pickCsvFile } from "@infrastructure/filePicker";
import {
  FileProblem,
  ParseOverrides,
  readImportFile,
} from "@screens/Financial/Transactions/models/importFile";
import { importOwnerChoices } from "@screens/Financial/Transactions/models/importWizard";

import { ImportWizardState } from "../useImportWizardViewModel";

const PREVIEW_ROWS = 5;

const PROBLEM_KEYS: Record<FileProblem, string> = {
  EMPTY: "financial.import.file.problems.empty",
  TOO_LARGE: "financial.import.file.problems.tooLarge",
  TOO_MANY_ROWS: "financial.import.file.problems.tooManyRows",
};

// Step 1 (spec 047 FR 9-12): the file, what was detected in it (each editable) and the owner of every row.
function useFileStepViewModel(wizard: ImportWizardState) {
  const [overrides, setOverrides] = useState<ParseOverrides>({});
  const [readFailed, setReadFailed] = useState(false);
  const { parsed } = wizard;

  async function onPick() {
    setReadFailed(false);

    try {
      const picked = await pickCsvFile();

      if (picked) {
        setOverrides({});
        wizard.onFileRead(readImportFile(picked));
      }
    } catch {
      setReadFailed(true);
    }
  }

  function override(next: ParseOverrides) {
    if (!parsed) {
      return;
    }

    const merged = { ...overrides, ...next };

    setOverrides(merged);
    wizard.onFileRead(readImportFile(parsed.file, merged));
  }

  return {
    columnCount: parsed?.table[0]?.length ?? 0,
    dateFormat: parsed?.dateFormat,
    decimal: parsed?.decimal,
    encoding: parsed?.encoding,
    fileName: parsed?.file.name,
    hasFile: !!parsed,
    headers: parsed?.table[0] ?? [],
    onDateFormatChange: (value: string) =>
      override({ dateFormat: value as DateFormat }),
    onDecimalChange: (value: string) =>
      override({ decimal: value as DecimalSeparator }),
    onEncodingChange: (value: string) =>
      override({ encoding: value as CsvEncoding }),
    onOwnerChange: wizard.onOwnerChange,
    onPick,
    onSeparatorChange: (value: string) =>
      override({ separator: value as CsvSeparator }),
    ownerChoices: importOwnerChoices(wizard.owners),
    ownerId: wizard.ownerId,
    previewRows: (parsed?.table ?? []).slice(1, 1 + PREVIEW_ROWS),
    problemKey: readFailed
      ? "financial.import.file.problems.readError"
      : parsed?.problem && PROBLEM_KEYS[parsed.problem],
    rowCount: Math.max((parsed?.table.length ?? 1) - 1, 0),
    separator: parsed?.separator,
    // The encoding select is only offered when the file was not UTF-8 (FR 10).
    showEncoding:
      parsed?.encoding === "Windows-1252" || overrides.encoding !== undefined,
  };
}

export default useFileStepViewModel;
