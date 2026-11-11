import InvestmentModel from "@data/models/investment/InvestmentModel";
import { FieldInvalid } from "@domain/entities/errors";
import {
  ApproveInvestmentEventSuggestionParams,
  CreateInvestmentEventParams,
  CreateInvestmentFractionSaleParams,
  GetInvestmentEventSuggestionsParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 108 section 7: corporate events, fraction sales and the event suggestions. Ratios, percent and cost per share
// are normalized ("0,5" -> "0.5") and must be above zero (cost per share: zero or more) BEFORE any call; `undefined`
// leaves a field alone, `null` clears the cost per new share.
async function approveEventSuggestion(
  params: ApproveInvestmentEventSuggestionParams,
) {
  const { id, ...fields } = params;
  const body = {
    bonusPercent: positive(fields.bonusPercent, "bonusPercent"),
    bonusUnitCost: unitCost(fields.bonusUnitCost),
    date: fields.date,
    ratioFrom: positive(fields.ratioFrom, "ratioFrom"),
    ratioTo: positive(fields.ratioTo, "ratioTo"),
    type: fields.type,
  };

  try {
    return InvestmentModel.toOperationResult(
      await api.post<Json>(
        `/v1/investments/event-suggestions/${id}/approve`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - approveEventSuggestion" },
      body,
    );
  }
}

async function createEvent(params: CreateInvestmentEventParams) {
  const body = {
    bonusPercent: positive(params.bonusPercent, "bonusPercent"),
    bonusUnitCost: unitCost(params.bonusUnitCost),
    date: params.date,
    ratioFrom: positive(params.ratioFrom, "ratioFrom"),
    ratioTo: positive(params.ratioTo, "ratioTo"),
    type: params.type,
  };

  try {
    return InvestmentModel.toOperationResult(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/operations`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createEvent" },
      body,
    );
  }
}

async function createFractionSale(params: CreateInvestmentFractionSaleParams) {
  const body = {
    accountId: params.generateTransaction ? params.accountId : undefined,
    date: params.date,
    fees: params.fees.map((fee) => ({
      amount: fee.amount,
      description: fee.description,
      kind: fee.kind,
    })),
    generateTransaction: params.generateTransaction,
    grossAmount: params.grossAmount,
  };

  try {
    return InvestmentModel.toOperationResult(
      await api.post<Json>(
        `/v1/investments/operations/${params.eventId}/fraction-sale`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createFractionSale" },
      body,
    );
  }
}

// The event and fraction sale fields of a PATCH on an operation, normalized like the create bodies.
function eventFieldsBody(fields: {
  bonusPercent?: string;
  bonusUnitCost?: null | string;
  grossAmount?: number;
  ratioFrom?: string;
  ratioTo?: string;
}) {
  return {
    bonusPercent: positive(fields.bonusPercent, "bonusPercent"),
    bonusUnitCost: unitCost(fields.bonusUnitCost),
    grossAmount: fields.grossAmount,
    ratioFrom: positive(fields.ratioFrom, "ratioFrom"),
    ratioTo: positive(fields.ratioTo, "ratioTo"),
  };
}

async function getEventSuggestions(
  params: GetInvestmentEventSuggestionsParams,
) {
  const query =
    params.assetId === undefined
      ? ""
      : `?assetId=${encodeURIComponent(params.assetId)}`;

  try {
    const data = await api.get<Json>(
      `/v1/investments/event-suggestions${query}`,
    );

    return ((data.items as Json[]) ?? []).map((item) =>
      InvestmentModel.toEventSuggestion(item),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getEventSuggestions",
    });
  }
}

function positive(
  value: string | undefined,
  field: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = parseDecimal(value);

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ [field]: value });
  }

  return formatDecimal(parsed);
}

async function rejectEventSuggestion(id: string) {
  try {
    await api.post(`/v1/investments/event-suggestions/${id}/reject`, {});
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - rejectEventSuggestion",
    });
  }
}

// The cost per new share: zero is allowed (it is the default), an empty value clears it on edit.
function unitCost(value: null | string | undefined): null | string | undefined {
  if (value === undefined || value === null) {
    return value;
  }
  if (value.trim() === "") {
    return null;
  }

  const parsed = parseDecimal(value);

  if (parsed === null) {
    throw new FieldInvalid({ bonusUnitCost: value });
  }

  return formatDecimal(parsed);
}

const eventApi = {
  approveEventSuggestion,
  createEvent,
  createFractionSale,
  getEventSuggestions,
  rejectEventSuggestion,
};

export { eventFieldsBody };
export default eventApi;
