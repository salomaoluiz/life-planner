import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentDashboardAllocation } from "@domain/entities/investment/InvestmentEntities";

export interface AllocationSlice {
  id: InvestmentAssetClass;
  label: string;
  share: number;
  swatch: string;
  usd: InvestmentDashboardAllocation["usd"];
  value: number;
}

// Spec 110 FR 15: the classes the API sends (already in the donut order, empty ones left out) with their label and colour.
function toAllocationSlices(
  allocation: InvestmentDashboardAllocation[],
  labelOf: (assetClass: InvestmentAssetClass) => string,
  colors: Record<InvestmentAssetClass, string>,
): AllocationSlice[] {
  return allocation.map((item) => ({
    id: item.assetClass,
    label: labelOf(item.assetClass),
    share: item.share,
    swatch: colors[item.assetClass],
    usd: item.usd,
    value: item.value,
  }));
}

export default toAllocationSlices;
