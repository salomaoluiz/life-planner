import InvestmentModel from "@data/models/investment/InvestmentModel";
import { FieldInvalid } from "@domain/entities/errors";
import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import {
  CreateFixedIncomeContributionParams,
  CreateFixedIncomeRedemptionParams,
  CreateFixedIncomeTitleParams,
  FixedIncomeRateParams,
  FixedIncomeTermsParams,
  PreviewFixedIncomeRedemptionParams,
  SimulateFixedIncomeParams,
  UpdateFixedIncomeRateParams,
  UpsertFixedIncomeAdjustmentParams,
  UpsertFixedIncomeTermsParams,
} from "@domain/repositories/investment";
import { api } from "@infrastructure/api";
import { formatDecimal, parseDecimal, ZERO } from "@utils/decimal";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 105 section 7: the fixed income routes. Percentages are normalized ("14,90" -> "14.9") and must be above zero
// BEFORE any call; the API derives the effective rate.
async function createFixedIncomeContribution(
  params: CreateFixedIncomeContributionParams,
) {
  const body = {
    accountId: params.generateTransaction ? params.accountId : undefined,
    amount: params.amount,
    date: params.date,
    generateTransaction: params.generateTransaction,
  };

  try {
    return InvestmentModel.toFixedIncomeWriteResult(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/fixed-income/contributions`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createFixedIncomeContribution" },
      body,
    );
  }
}

async function createFixedIncomeRate(
  assetId: string,
  rate: FixedIncomeRateParams,
) {
  const body = rateBody(rate);

  try {
    const data = await api.post<{ item: Json }>(
      `/v1/investments/assets/${assetId}/fixed-income/rates`,
      body,
    );

    return InvestmentModel.toAssetDetail(data.item);
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createFixedIncomeRate" },
      body,
    );
  }
}

async function createFixedIncomeRedemption(
  params: CreateFixedIncomeRedemptionParams,
) {
  const body = {
    accountId: params.generateTransaction ? params.accountId : undefined,
    date: params.date,
    generateTransaction: params.generateTransaction,
    kind: params.kind,
    netAmount: params.netAmount,
  };

  try {
    return InvestmentModel.toFixedIncomeWriteResult(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/fixed-income/redemptions`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createFixedIncomeRedemption" },
      body,
    );
  }
}

async function createFixedIncomeTitle(params: CreateFixedIncomeTitleParams) {
  const body = {
    contribution: {
      accountId: params.contribution.generateTransaction
        ? params.contribution.accountId
        : undefined,
      amount: params.contribution.amount,
      date: params.contribution.date,
      generateTransaction: params.contribution.generateTransaction,
    },
    name: params.name,
    owner: params.owner,
    ownerId: params.ownerId,
    rate: rateBody(params.rate),
    terms: termsBody(params.terms),
  };

  try {
    const data = await api.post<{ item: Json }>(
      "/v1/investments/fixed-income",
      body,
    );

    return InvestmentModel.toAssetDetail(data.item);
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - createFixedIncomeTitle" },
      body,
    );
  }
}

async function deleteFixedIncomeAdjustment(id: string) {
  try {
    await api.delete(`/v1/investments/fixed-income/adjustments/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteFixedIncomeAdjustment",
    });
  }
}

async function deleteFixedIncomeRate(id: string) {
  try {
    await api.delete(`/v1/investments/fixed-income/rates/${id}`);
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - deleteFixedIncomeRate",
    });
  }
}

// "14,90" -> "14.9"; a percentage must be a decimal above zero (FieldInvalid names the field).
function percent(value: string | undefined, field: string): string {
  const parsed = parseDecimal(value ?? "");

  if (parsed === null || parsed <= ZERO) {
    throw new FieldInvalid({ [field]: value ?? "" });
  }

  return formatDecimal(parsed);
}

async function previewFixedIncomeRedemption(
  params: PreviewFixedIncomeRedemptionParams,
) {
  const body = {
    date: params.date,
    kind: params.kind,
    netAmount: params.netAmount,
  };

  try {
    return InvestmentModel.toFixedIncomeRedemptionPreview(
      await api.post<Json>(
        `/v1/investments/assets/${params.assetId}/fixed-income/redemption-preview`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - previewFixedIncomeRedemption" },
      body,
    );
  }
}

// The mode decides which fields go: the API rejects a field that does not belong to it.
function rateBody(rate: FixedIncomeRateParams) {
  const startDate = rate.startDate;

  switch (rate.mode) {
    case InvestmentFixedIncomeRateMode.CDI_PERCENT:
      return {
        cdiPercent: percent(rate.cdiPercent, "cdiPercent"),
        indexRate: percent(rate.indexRate, "indexRate"),
        mode: rate.mode,
        startDate,
      };
    case InvestmentFixedIncomeRateMode.IPCA_PLUS:
      return {
        indexRate: percent(rate.indexRate, "indexRate"),
        mode: rate.mode,
        spread: percent(rate.spread, "spread"),
        startDate,
      };
    case InvestmentFixedIncomeRateMode.PREFIXED:
      return {
        annualRate: percent(rate.annualRate, "annualRate"),
        mode: rate.mode,
        startDate,
      };
  }
}

async function simulateFixedIncome(params: SimulateFixedIncomeParams) {
  const body = {
    amount: params.amount,
    date: params.date,
    maturityDate: params.maturityDate,
    rate: rateBody(params.rate),
    taxExempt: params.taxExempt,
  };

  try {
    return InvestmentModel.toFixedIncomeSimulation(
      await api.post<Json>("/v1/investments/fixed-income/simulate", body),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - simulateFixedIncome" },
      body,
    );
  }
}

function termsBody(terms: FixedIncomeTermsParams) {
  return {
    liquidity: terms.liquidity,
    liquidityDate: terms.liquidityDate ?? undefined,
    maturityDate: terms.maturityDate,
    product: terms.product,
    taxExempt: terms.taxExempt,
  };
}

async function updateFixedIncomeRate(params: UpdateFixedIncomeRateParams) {
  const body = rateBody(params.rate);

  try {
    const data = await api.patch<{ item: Json }>(
      `/v1/investments/fixed-income/rates/${params.id}`,
      body,
    );

    return InvestmentModel.toAssetDetail(data.item);
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - updateFixedIncomeRate" },
      body,
    );
  }
}

async function upsertFixedIncomeAdjustment(
  params: UpsertFixedIncomeAdjustmentParams,
) {
  const body = { grossAmount: params.grossAmount };

  try {
    return InvestmentModel.toFixedIncomeAdjustmentResult(
      await api.put<Json>(
        `/v1/investments/assets/${params.assetId}/fixed-income/adjustments/${params.date}`,
        body,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - upsertFixedIncomeAdjustment" },
      body,
    );
  }
}

async function upsertFixedIncomeTerms(params: UpsertFixedIncomeTermsParams) {
  const body = {
    ...termsBody(params.terms),
    rate: params.rate ? rateBody(params.rate) : undefined,
  };

  try {
    const data = await api.put<{ item: Json }>(
      `/v1/investments/assets/${params.assetId}/fixed-income/terms`,
      body,
    );

    return InvestmentModel.toAssetDetail(data.item);
  } catch (error) {
    return handleInvestmentApiError(
      error,
      { datasource: "InvestmentDatasource - upsertFixedIncomeTerms" },
      body,
    );
  }
}

const fixedIncomeApi = {
  createFixedIncomeContribution,
  createFixedIncomeRate,
  createFixedIncomeRedemption,
  createFixedIncomeTitle,
  deleteFixedIncomeAdjustment,
  deleteFixedIncomeRate,
  previewFixedIncomeRedemption,
  simulateFixedIncome,
  updateFixedIncomeRate,
  upsertFixedIncomeAdjustment,
  upsertFixedIncomeTerms,
};

export default fixedIncomeApi;
