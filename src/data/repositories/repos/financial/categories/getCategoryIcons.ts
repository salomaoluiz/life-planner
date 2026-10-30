import { Datasources } from "@data/datasource";
import { CategoryIconEntity } from "@domain/entities/financial/CategoryIconEntity";
import { FinancialCategoryRepository } from "@domain/repositories/financial";

export type Params = Parameters<
  FinancialCategoryRepository["getCategoryIcons"]
>[0];

// The catalog is global and read-only: no cache here, React Query caches each query.
async function getCategoryIcons(
  params: Params,
  datasources: Datasources,
): Promise<CategoryIconEntity[]> {
  const icons =
    await datasources.financialCategoryDatasource.getCategoryIcons(params);

  return icons.map((icon) => ({
    common: icon.common,
    group: icon.group,
    labelEn: icon.labelEn,
    labelPt: icon.labelPt,
    name: icon.name,
  }));
}

export default getCategoryIcons;
