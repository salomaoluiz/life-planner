import {
  isoToCalendarDate,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { decimalStringToCents } from "@data/models/financial/money";
import TransferModel, {
  TransferWithRows,
} from "@data/models/financial/TransferModel";
import { TransferDatasource } from "@data/repositories/repos/financial/transfers/transferDatasource";
import { api } from "@infrastructure/api";

import handleFinancialApiError from "../../financialApiError";
import unprocessableError from "../../transactions/unprocessableError";

export type Params = Parameters<TransferDatasource["createTransfer"]>[0];
export type Response = ReturnType<TransferDatasource["createTransfer"]>;

async function createTransfer(params: Params): Response {
  // Conversions throw FieldInvalid BEFORE any network call.
  const body = {
    amountIn:
      params.amountIn === undefined
        ? undefined
        : decimalStringToCents(params.amountIn),
    amountOut: decimalStringToCents(params.amountOut),
    dateIn:
      params.dateIn === undefined
        ? undefined
        : isoToCalendarDate(params.dateIn),
    dateOut: isoToCalendarDate(params.dateOut),
    description: params.description,
    fee:
      params.fee === undefined ? undefined : decimalStringToCents(params.fee),
    fromAccountId: params.fromAccountId,
    notes: params.notes ?? undefined,
    paid: params.paid,
    recurrence: params.recurrence && {
      endDate:
        params.recurrence.endDate === undefined
          ? undefined
          : isoToCalendarDate(params.recurrence.endDate),
      frequency: params.recurrence.frequency,
    },
    toAccountId: params.toAccountId,
  };

  try {
    const response = await api.post<TransferWithRows>(
      `/v1/finance/transfers?today=${todayCalendarDate()}`,
      body,
    );

    return TransferModel.fromResponse(response);
  } catch (error) {
    return handleFinancialApiError(
      error,
      { datasource: "TransferDatasource - createTransfer" },
      { fields: body, unprocessable: unprocessableError },
    );
  }
}

export default createTransfer;
