import { decode, encode } from "@infrastructure/crypto";
import { RouteDecryptedProps } from "@screens/Feedback/BusinessFeedback/types";

async function createFeedbackRouteEncoded(
  params: RouteDecryptedProps,
): Promise<{ feedback: string }> {
  const route = {
    closeButton: params.closeButton,
    message: params.message,
    primaryButton: params.primaryButton,
    title: params.title,
    type: params.type,
  };

  const feedback = await encode(route);

  return { feedback };
}

async function decodeRouteParams(encodedParams: {
  feedback: string;
}): Promise<RouteDecryptedProps> {
  const route = await decode<RouteDecryptedProps>(encodedParams.feedback);

  return {
    closeButton: route.closeButton,
    message: route.message,
    primaryButton: route.primaryButton,
    title: route.title,
    type: route.type,
  };
}

export { createFeedbackRouteEncoded, decodeRouteParams };
