import { isoToCalendarDate } from "@data/models/financial/calendarDate";
import {
  decimalStringToCents,
  signedDecimalStringToCents,
} from "@data/models/financial/money";
import { SplitPartParams } from "@data/repositories/repos/financial/splits/splitDatasource";

function toBody(params: {
  accountId?: string;
  creditCardId?: string;
  date?: string;
  description?: string;
  invoiceMonth?: string;
  notes?: null | string;
  paid?: boolean;
  parts?: SplitPartParams[];
  total?: string;
}) {
  // Conversions throw FieldInvalid BEFORE any network call.
  return {
    accountId: params.accountId,
    creditCardId: params.creditCardId,
    date:
      params.date === undefined ? undefined : isoToCalendarDate(params.date),
    description: params.description,
    invoiceMonth: params.invoiceMonth,
    notes: params.notes === undefined ? undefined : (params.notes ?? ""),
    paid: params.paid,
    parts: params.parts?.map((part) => ({
      categoryId: part.categoryId,
      description: part.description ?? undefined,
      id: part.id,
      systemKey: part.systemKey,
      tags: part.tags,
      type: part.type,
      value: signedDecimalStringToCents(part.value),
    })),
    total:
      params.total === undefined
        ? undefined
        : decimalStringToCents(params.total),
  };
}

export default toBody;
