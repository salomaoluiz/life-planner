import ActivityModels from "@data/models/activity/ActivityModels";
import { ActivityDatasource } from "@data/repositories/repos/activity/activityDatasource";
import { api } from "@infrastructure/api";

type Json = Record<string, unknown>;

const BASE = "/v1/activity";

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ).toString();

  return search ? `?${search}` : "";
}

// Spec 127 section 7. Money history: always read from the API, never cached.
export const activityApi: ActivityDatasource = {
  async getActivity({ action, actorId, cursor, from, module, ownerId, q, to }) {
    return ActivityModels.pageFromJSON(
      await api.get<Json>(
        `${BASE}${query({ action, actorId, cursor, from, module, ownerId, q, to })}`,
      ),
    );
  },
  async getActivityItems({ cursor, id, q }) {
    return ActivityModels.batchPageFromJSON(
      await api.get<Json>(`${BASE}/${id}/items${query({ cursor, q })}`),
    );
  },
};
