import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentDashboardRanking } from "@domain/entities/investment/InvestmentEntities";
import { TranslationKeys } from "@presentation/i18n/types";

export const RANKING_VISIBLE = 10;

export interface RankingView {
  canExpand: boolean;
  rows: InvestmentDashboardRanking[];
  // Rows of the chosen class (every row without a class filter)
  total: number;
}

// Width of the bar of a row against the biggest row of the list (0..1).
function barRatio(
  row: InvestmentDashboardRanking,
  rows: InvestmentDashboardRanking[],
): number {
  const max = Math.max(0, ...rows.map((item) => item.value));

  return max === 0 ? 0 : Math.min(Math.max(row.value, 0) / max, 1);
}

// The note under a value that is not a plain quote (spec 110 FR 19).
function captionKey(
  row: InvestmentDashboardRanking,
): TranslationKeys | undefined {
  switch (row.valueKind) {
    case "COST":
      return "investment.overview.ranking.atCost";
    case "FIXED_INCOME_NET":
      return "investment.overview.ranking.estimatedNet";
    case "MANUAL":
      return "investment.overview.ranking.manualValue";
    default:
      return undefined;
  }
}

// Spec 110 FR 18-20: the open positions (already sorted by value), the tapped class only, 10 rows until "See all".
function rankingView(
  ranking: InvestmentDashboardRanking[],
  selectedClass: InvestmentAssetClass | undefined,
  expanded: boolean,
): RankingView {
  const filtered = selectedClass
    ? ranking.filter((row) => row.assetClass === selectedClass)
    : ranking;

  return {
    canExpand: !expanded && filtered.length > RANKING_VISIBLE,
    rows: expanded ? filtered : filtered.slice(0, RANKING_VISIBLE),
    total: filtered.length,
  };
}

export { barRatio, captionKey, rankingView };
