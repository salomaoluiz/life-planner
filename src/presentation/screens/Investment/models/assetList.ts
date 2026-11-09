import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import {
  ASSET_CLASS_ORDER,
  InvestmentAssetClass,
} from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { ALL_OWNERS } from "@screens/Financial/models/ownerOptions";

export interface AssetRow {
  asset: InvestmentAsset;
  ownerLabel: "personal" | { family: string };
}

export type ListEntry =
  | {
      assetClass: InvestmentAssetClass;
      cost: number;
      count: number;
      currency: CurrencyCode;
      // Sum of the assets that have a value; null when none has one.
      current: null | number;
      key: string;
      kind: "group";
    }
  | { key: string; kind: "row"; row: AssetRow };

// Spec 102 FR 33: rows grouped by class with a subtotal per class AND currency (currencies are never added).
export function buildEntries(rows: AssetRow[]): ListEntry[] {
  const entries: ListEntry[] = [];

  for (const assetClass of ASSET_CLASS_ORDER) {
    const ofClass = rows.filter((row) => row.asset.assetClass === assetClass);
    const currencies = [...new Set(ofClass.map((row) => row.asset.currency))];

    for (const currency of currencies.sort()) {
      const group = ofClass.filter((row) => row.asset.currency === currency);
      const valued = group.filter(
        (row) => row.asset.position.currentValue !== null,
      );

      entries.push({
        assetClass,
        cost: sum(group.map((row) => row.asset.position.cost)),
        count: group.length,
        currency,
        current:
          valued.length === 0
            ? null
            : sum(valued.map((row) => row.asset.position.currentValue ?? 0)),
        key: `${assetClass}-${currency}`,
        kind: "group",
      });
      entries.push(
        ...group.sort(byLabel).map((row) => ({
          key: row.asset.id,
          kind: "row" as const,
          row,
        })),
      );
    }
  }

  return entries;
}

// "All" hides the assets of archived families; an explicit owner (even an archived family) shows its own.
export function filterAssets(
  assets: InvestmentAsset[],
  owners: OwnerDTO[],
  ownerFilter: string,
  search: string,
): AssetRow[] {
  const archivedOwners = new Set(
    owners.filter((owner) => owner.archived).map((owner) => owner.id),
  );
  const term = normalize(search.trim());

  return assets
    .filter((asset) =>
      ownerFilter === ALL_OWNERS
        ? !archivedOwners.has(asset.ownerId)
        : asset.ownerId === ownerFilter,
    )
    .filter(
      (asset) =>
        term === "" ||
        normalize(asset.ticker ?? "").includes(term) ||
        normalize(asset.name).includes(term),
    )
    .map((asset) => ({ asset, ownerLabel: ownerLabelOf(asset, owners) }));
}

function byLabel(a: AssetRow, b: AssetRow): number {
  return labelOf(a.asset).localeCompare(labelOf(b.asset));
}

function labelOf(asset: InvestmentAsset): string {
  return asset.ticker ?? asset.name;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function ownerLabelOf(
  asset: InvestmentAsset,
  owners: OwnerDTO[],
): AssetRow["ownerLabel"] {
  const owner = owners.find((item) => item.id === asset.ownerId);

  return owner?.type === OwnerType.FAMILY ? { family: owner.name } : "personal";
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export { labelOf };
