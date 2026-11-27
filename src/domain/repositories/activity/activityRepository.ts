import {
  ActivityBatchFilters,
  ActivityBatchPageEntity,
  ActivityFilters,
  ActivityPageEntity,
} from "@domain/entities/activity/ActivityEntity";

// Spec 127 section 7: read-only; the entries are written by the API itself.
export type ActivityRepository = {
  getActivity(params: ActivityFilters): Promise<ActivityPageEntity>;
  getActivityItems(
    params: ActivityBatchFilters,
  ): Promise<ActivityBatchPageEntity>;
};
