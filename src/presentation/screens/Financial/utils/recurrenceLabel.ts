import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";
import { TranslationKeys } from "@presentation/i18n/types";

type Translate = (
  key: TranslationKeys,
  params?: Record<string, number | string>,
) => string;

// Spec 114 FR 9: "Monthly" for every 1, "Every 2 months" for more.
function recurrenceLabel(t: Translate, frequency: RecurrenceFrequency) {
  return frequency.interval === 1
    ? t(`financial.recurrence.label.${frequency.unit}`)
    : t(`financial.recurrence.labelMany.${frequency.unit}`, {
        n: frequency.interval,
      });
}

// The lowercase variant used inside sentences: "every month", "every 3 weeks".
function recurrenceLabelEvery(t: Translate, frequency: RecurrenceFrequency) {
  return frequency.interval === 1
    ? t(`financial.recurrence.frequencyEvery.${frequency.unit}`)
    : t(`financial.recurrence.frequencyEveryMany.${frequency.unit}`, {
        n: frequency.interval,
      });
}

export { recurrenceLabel, recurrenceLabelEvery };
