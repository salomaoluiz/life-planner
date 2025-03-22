import { decode } from "@infrastructure/crypto";

import { RouteDecryptedProps, RouteProps } from "./types";

async function decodeRouteParams(encodedParams: {
  token: string;
}): Promise<RouteProps> {
  const route = await decode<RouteDecryptedProps>(encodedParams.token);

  return {
    email: route.email,
    familyId: route.familyId,
    inviteDate: new Date(route.inviteDate),
  };
}

export { decodeRouteParams };
