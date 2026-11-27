import { ActivityRepository } from "@domain/repositories/activity";

// Same operations as the repository (the API is the only source, nothing is cached).
export type ActivityDatasource = ActivityRepository;
