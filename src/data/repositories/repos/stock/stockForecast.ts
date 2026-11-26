import { Datasources } from "@data/datasource";
import {
  ConsumptionWeekEntity,
  WasteEntity,
} from "@domain/entities/stock/StockWasteEntity";
import {
  DismissLeftoverRepositoryParams,
  GetConsumptionWeeksRepositoryParams,
  GetWasteRepositoryParams,
} from "@domain/repositories/stock";

export async function dismissLeftover(
  params: DismissLeftoverRepositoryParams,
  datasources: Datasources,
): Promise<void> {
  await datasources.stockDatasource.dismissLeftover(params);
}

export async function getConsumptionWeeks(
  params: GetConsumptionWeeksRepositoryParams,
  datasources: Datasources,
): Promise<ConsumptionWeekEntity[]> {
  return datasources.stockDatasource.getConsumptionWeeks(params);
}

export async function getWaste(
  params: GetWasteRepositoryParams,
  datasources: Datasources,
): Promise<WasteEntity> {
  return datasources.stockDatasource.getWaste(params);
}
