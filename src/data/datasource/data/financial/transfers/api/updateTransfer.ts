import { isoToCalendarDate } from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import TransferModel, {
  TransferWithRows,
} from "@data/models/financial/TransferModel";
import { TransferDatasource } from "@data/repositories/repos/financial/transfers/transferDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<TransferDatasource["updateTransfer"]>[0];
export type Response = ReturnType<TransferDatasource["updateTransfer"]>;

function optionalCents(value?: string) {
  return value === undefined ? undefined : decimalStringToCents(value);
}

function optionalDate(value?: string) {
  return value === undefined ? undefined : isoToCalendarDate(value);
}

async function updateTransfer(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call.
  const body = {
    amountIn: optionalCents(params.amountIn),
    amountOut: optionalCents(params.amountOut),
    dateIn: optionalDate(params.dateIn),
    dateOut: optionalDate(params.dateOut),
    description: params.description,
    // `null` removes the fee; absent keeps it.
    fee: params.fee === null ? null : optionalCents(params.fee ?? undefined),
    fromAccountId: params.fromAccountId,
    notes: params.notes,
    paid: params.paid,
    scope: params.scope,
    toAccountId: params.toAccountId,
  };

  try {
    const response = await api.patch<TransferWithRows>(
      `/v1/finance/transfers/${params.id}`,
      body,
    );

    return TransferModel.fromResponse(response);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "TransferDatasource - updateTransfer", id: params.id },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default updateTransfer;
