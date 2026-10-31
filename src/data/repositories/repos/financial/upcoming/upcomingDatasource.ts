import { UpcomingEntity } from "@domain/entities/financial/UpcomingEntity";
import { GetUpcomingRepositoryParams } from "@domain/repositories/financial";

export interface UpcomingDatasource {
  getUpcoming(params: GetUpcomingRepositoryParams): Promise<UpcomingEntity>;
}
