import { Tone } from "@components/utils/tones";
import { AppEnvironment } from "@domain/entities/version/VersionEntity";
import { VersionStatus } from "@domain/entities/version/versionStatus";
import { TranslationKeys } from "@presentation/i18n/types";

interface StatusChip {
  count?: number;
  key: TranslationKeys;
  tone: Tone;
}

const ENVIRONMENT_KEYS: Record<AppEnvironment, TranslationKeys> = {
  DEVELOPMENT: "versions.env.development",
  PRODUCTION: "versions.env.production",
  STAGING: "versions.env.staging",
};

function environmentKey(environment: AppEnvironment): TranslationKeys {
  return ENVIRONMENT_KEYS[environment];
}

// One summary chip for the footer: API down wins, then pending updates, then "not checked".
function statusChip(status: VersionStatus): StatusChip {
  if (status.api === "UNAVAILABLE") {
    return { key: "versions.status.apiDown", tone: "expense" };
  }
  if (status.updates > 0) {
    return {
      count: status.updates,
      key:
        status.updates === 1
          ? "versions.status.updates_one"
          : "versions.status.updates_other",
      tone: "warning",
    };
  }
  if (status.api === "UNKNOWN" || status.app === "UNKNOWN") {
    return { key: "versions.status.unknown", tone: "neutral" };
  }

  return { key: "versions.status.upToDate", tone: "income" };
}

export type { StatusChip };
export { environmentKey, statusChip };
