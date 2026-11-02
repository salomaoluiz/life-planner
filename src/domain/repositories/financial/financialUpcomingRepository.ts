import { UpcomingEntity } from "@domain/entities/financial/UpcomingEntity";

export type FinancialUpcomingRepository = {
  getUpcoming(params: GetUpcomingRepositoryParams): Promise<UpcomingEntity>;
};

// `days` (window after today) and `limit` (items of that window) default to 7 and 5 on the API.
interface GetUpcomingRepositoryParams {
  days?: number;
  limit?: number;
  ownerIds: string[];
}

export type { GetUpcomingRepositoryParams };
