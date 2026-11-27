import { Datasources } from "@data/datasource";
import { ActivityRepository } from "@domain/repositories/activity";

// Never cached: the history must show what the server has now.
function activityRepositoryImpl(datasources: Datasources): ActivityRepository {
  const datasource = datasources.activityDatasource;

  return {
    getActivity: async (params) => datasource.getActivity(params),
    getActivityItems: async (params) => datasource.getActivityItems(params),
  };
}

export default activityRepositoryImpl;
