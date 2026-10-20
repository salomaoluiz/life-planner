import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";
import {
  FamilyArchived,
  FamilyHasPendingItems,
  FamilyNotFound,
  FieldInvalid,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import handleFamilyApiError from "./familyApiError";

export type Params = Parameters<FamilyDatasource["updateFamily"]>[0];

export type Response = ReturnType<FamilyDatasource["updateFamily"]>;
// The 409 body lists what blocks the archive; a 409 without it stays a generic failure instead of an empty dialog.
function pendingItemsOf(body: Record<string, unknown>) {
  if (typeof body.blockers !== "object" || body.blockers === null) {
    return undefined;
  }

  return new FamilyHasPendingItems(
    body.blockers as ConstructorParameters<typeof FamilyHasPendingItems>[0],
  );
}

async function updateFamily(params: Params): Response {
  try {
    // A request renames or changes the status, never both (spec 042).
    await api.patch(`/v1/families/${params.id}`, {
      name: params.name,
      status: params.status,
    });
  } catch (error) {
    return handleFamilyApiError(
      error,
      { datasource: "FamilyDatasource - updateFamily", id: params.id },
      {
        400: () => new FieldInvalid({ name: params.name }),
        404: () => new FamilyNotFound(),
        409: (error) => pendingItemsOf(error.body),
        422: () => new FamilyArchived(),
      },
    );
  }
}

export default updateFamily;
