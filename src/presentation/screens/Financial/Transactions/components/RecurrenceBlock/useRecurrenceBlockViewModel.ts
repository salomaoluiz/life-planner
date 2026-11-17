import {
  isRecurrenceFrequency,
  RECURRENCE_INTERVAL_MAX,
  RecurrenceFrequency,
  RecurrenceUnit,
} from "@domain/entities/financial/RecurrenceEntity";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import {
  clampIntervalForUnit,
  recurrenceLastDate,
  recurrenceNextDates,
  recurrenceOccurrenceCount,
} from "@screens/Financial/models/recurrence";
import { recurrenceLabel } from "@screens/Financial/utils/recurrenceLabel";

const NEXT_DATES = 3;

export interface RecurrenceBlockViewModelParams {
  endDate?: Date;
  frequency: RecurrenceFrequency;
  onChange: (frequency: RecurrenceFrequency) => void;
  startDate: Date;
}

// Hint, range error and preview of the repetition block (spec 114 section 8).
function useRecurrenceBlockViewModel(params: RecurrenceBlockViewModelParams) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { endDate, frequency, onChange, startDate } = params;
  const { interval, unit } = frequency;
  const max = RECURRENCE_INTERVAL_MAX[unit];
  const isValid = isRecurrenceFrequency(frequency);

  function unitWord(count: number, target: RecurrenceUnit = unit) {
    return t(pluralKey(`financial.recurrence.unitWord.${target}`, count));
  }

  function formatDate(date: Date, withYear: boolean) {
    return new Intl.DateTimeFormat(localeTag, {
      day: "2-digit",
      month: "2-digit",
      ...(withYear ? { year: "numeric" } : {}),
    }).format(date);
  }

  function buildPreview() {
    if (!isValid) {
      return undefined;
    }

    const label = recurrenceLabel(t, frequency);
    const next = recurrenceNextDates(startDate, frequency, endDate, NEXT_DATES);
    const nextText = next.length
      ? t("financial.recurrence.previewNext", {
          dates: next
            .map((date, index) => formatDate(date, index === next.length - 1))
            .join(", "),
        })
      : "";

    if (!endDate) {
      return [t("financial.recurrence.previewForever", { label }), nextText]
        .filter(Boolean)
        .join(" ");
    }

    const last = recurrenceLastDate(startDate, endDate, frequency);

    if (!last) {
      return undefined;
    }

    return [
      t("financial.recurrence.previewTimes", {
        date: formatDate(last, true),
        label,
        n: recurrenceOccurrenceCount(startDate, endDate, frequency),
      }),
      nextText,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return {
    error: isValid
      ? undefined
      : [
          t("financial.recurrence.intervalError", {
            max,
            unit: unitWord(max),
          }),
          unit === "YEAR" ? "" : t("financial.recurrence.intervalErrorLonger"),
        ]
          .filter(Boolean)
          .join(" "),
    hint: [
      t("financial.recurrence.intervalHint", { max, unit: unitWord(max) }),
      unit === "MONTH" || unit === "YEAR"
        ? t("financial.recurrence.monthEndHint", { day: startDate.getDate() })
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    isValid,
    onIntervalChange: (next: number) => onChange({ interval: next, unit }),
    onUnitChange: (next: RecurrenceUnit) =>
      onChange({ interval: clampIntervalForUnit(next, interval), unit: next }),
    preview: buildPreview(),
    unitWord: unitWord(interval),
  };
}

export default useRecurrenceBlockViewModel;
