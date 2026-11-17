import InvestmentModel from "@data/models/investment/InvestmentModel";
import { GetInvestmentMarketIndexHistoryParams } from "@domain/repositories/investment";
import { api } from "@infrastructure/api";

import handleInvestmentApiError from "./investmentApiError";

type Json = Record<string, unknown>;

// Spec 113 section 7: stored CDI, Selic, IPCA and FX; the history of one index in a period.
async function getMarketIndexes() {
  try {
    return InvestmentModel.toMarketIndexes(
      await api.get<Json>("/v1/investments/market-indexes"),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getMarketIndexes",
    });
  }
}

async function getMarketIndexHistory(
  params: GetInvestmentMarketIndexHistoryParams,
) {
  const query = `from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`;

  try {
    return InvestmentModel.toMarketIndexHistory(
      await api.get<Json>(
        `/v1/investments/market-indexes/${params.index}/history?${query}`,
      ),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - getMarketIndexHistory",
    });
  }
}

// The API answers 429 REFRESH_TOO_SOON, mapped to `QuoteRefreshTooSoon` by the investment error handler.
async function refreshMarketIndexes() {
  try {
    return InvestmentModel.toMarketIndexes(
      await api.post<Json>("/v1/investments/market-indexes/refresh", {}),
    );
  } catch (error) {
    return handleInvestmentApiError(error, {
      datasource: "InvestmentDatasource - refreshMarketIndexes",
    });
  }
}

export default {
  getMarketIndexes,
  getMarketIndexHistory,
  refreshMarketIndexes,
};
