import { BusinessError } from "@domain/entities/errors/common";
import { DefaultError } from "@domain/entities/errors/common/errors";

import { redactSearch, scrub } from "./scrub";

const DEFAULT_MESSAGE = "Occurred an error";

interface CaptureOptions {
  contexts?: Record<string, Record<string, unknown>>;
  extra?: Record<string, unknown>;
  fingerprint?: string[];
  tags?: Record<string, string>;
}

// The title, tags, context and fingerprint that make an issue readable (spec 106, 5.2.6-7).
function buildCaptureOptions(
  error: unknown,
  extra?: Record<string, unknown>,
): CaptureOptions {
  if (!(error instanceof DefaultError)) {
    return { extra };
  }

  const context = scrub(error.context);
  const fingerprint = error.context.fingerprint;
  titleDefaultMessage(error, context);

  return {
    contexts: { error_context: context },
    extra,
    ...(Array.isArray(fingerprint)
      ? { fingerprint: fingerprint.map(String) }
      : {}),
    tags: { error_code: error.code },
  };
}

// Spec 106 (5.2.8): business (4xx), offline (ConnectivityError) and logged-out errors are all BusinessErrors: expected: never an event.
function isExpectedError(error: unknown): boolean {
  return error instanceof BusinessError;
}

// An error with the default message gets what produced it (use case or cache key) as the title.
function titleDefaultMessage(error: Error, context: Record<string, unknown>) {
  const source = context.useCase ?? context.cacheString;

  if (error.message === DEFAULT_MESSAGE && typeof source === "string") {
    error.message = `${DEFAULT_MESSAGE} (${redactSearch(source)})`;
  }
}

export { buildCaptureOptions, isExpectedError };
export type { CaptureOptions };
