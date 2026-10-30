import { router } from "expo-router";
import { useState } from "react";
import { Linking } from "react-native";

import { Tone } from "@components/utils/tones";
import { ReleaseEntity } from "@domain/entities/version/VersionEntity";
import {
  ApiStatus,
  AppStatus,
  newerReleases,
} from "@domain/entities/version/versionStatus";
import { reloadApp } from "@infrastructure/appInfo";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import { TranslationKeys } from "@presentation/i18n/types";
import useLocaleTag from "@presentation/i18n/useLocaleTag";

import { formatDate, formatDateTime, timeAgo } from "../utils";

interface CardField {
  highlight?: boolean;
  key: TranslationKeys;
  value: string;
}

interface CardModel {
  action?: { kind: "release" | "reload"; version: string };
  fields: CardField[];
  hint?: { key: TranslationKeys; version: string };
  label: TranslationKeys;
  service: Service;
  statusKey: TranslationKeys;
  tone: Tone;
  version: string;
  whatChanged: boolean;
}

type Service = "api" | "app";

const MAX_RELEASES = 10;

const APP_STATUS: Record<AppStatus, { key: TranslationKeys; tone: Tone }> = {
  APK_BEHIND: { key: "versions.status.apkBehind", tone: "warning" },
  DEPLOY_PENDING: { key: "versions.status.deployPending", tone: "warning" },
  RELOAD: { key: "versions.status.reload", tone: "warning" },
  UNKNOWN: { key: "versions.status.unknown", tone: "neutral" },
  UP_TO_DATE: { key: "versions.status.upToDate", tone: "income" },
};
const API_STATUS: Record<ApiStatus, { key: TranslationKeys; tone: Tone }> = {
  DEPLOY_PENDING: { key: "versions.status.deployPending", tone: "warning" },
  UNAVAILABLE: { key: "versions.status.apiDown", tone: "expense" },
  UNKNOWN: { key: "versions.status.unknown", tone: "neutral" },
  UP_TO_DATE: { key: "versions.status.upToDate", tone: "income" },
};
const APP_LABEL: Record<string, TranslationKeys> = {
  android: "versions.card.appAndroid",
  ios: "versions.card.appIos",
  web: "versions.card.appWeb",
};

function useVersionsViewModel() {
  const localeTag = useLocaleTag();
  const version = useVersionInfo();
  const [changes, setChanges] = useState<null | Service>(null);
  const { info, status } = version;
  const dash = "—";

  const appReleases = newerReleases(
    info?.app.releases ?? [],
    version.runningVersion,
  );
  const apiReleases = newerReleases(
    info?.api.releases ?? [],
    info?.api.current ?? "0.0.0",
  );
  const appReleased = info?.app.releases.find(
    (release) => release.version === version.runningVersion,
  )?.publishedAt;

  const appFields: CardField[] = [
    {
      key: "versions.field.build",
      value: formatDateTime(version.appBuiltAt, localeTag) ?? dash,
    },
    {
      key: "versions.field.released",
      value: formatDate(appReleased ?? null, localeTag) ?? dash,
    },
  ];
  if (version.platform === "web") {
    appFields.push({
      highlight: status.app === "RELOAD",
      key: "versions.field.liveVersion",
      value: version.servedVersion ?? dash,
    });
  }
  appFields.push({
    highlight: status.app === "DEPLOY_PENDING" || status.app === "APK_BEHIND",
    key: "versions.field.latest",
    value: info?.app.latest ?? dash,
  });

  const appCard: CardModel = {
    action: appAction(),
    fields: appFields,
    hint: appHint(),
    label: APP_LABEL[version.platform],
    service: "app",
    statusKey: APP_STATUS[status.app].key,
    tone: APP_STATUS[status.app].tone,
    version: version.runningVersion,
    whatChanged: appReleases.length > 0,
  };
  const apiCard: CardModel = {
    fields: [
      {
        key: "versions.field.build",
        value: formatDateTime(info?.api.builtAt ?? null, localeTag) ?? dash,
      },
      {
        key: "versions.field.released",
        value: formatDate(info?.api.releasedAt ?? null, localeTag) ?? dash,
      },
      {
        key: "versions.field.liveSince",
        value: formatDateTime(info?.api.startedAt ?? null, localeTag) ?? dash,
      },
      {
        highlight: status.api === "DEPLOY_PENDING",
        key: "versions.field.latest",
        value: info?.api.latest ?? dash,
      },
    ],
    hint:
      status.api === "DEPLOY_PENDING" && info?.api.latest
        ? { key: "versions.hint.apiPending", version: info.api.latest }
        : undefined,
    label: "versions.card.api",
    service: "api",
    statusKey: API_STATUS[status.api].key,
    tone: API_STATUS[status.api].tone,
    version: info?.api.current ?? dash,
    whatChanged: apiReleases.length > 0,
  };

  function appAction(): CardModel["action"] {
    if (status.app === "RELOAD" && version.platform === "web") {
      return { kind: "reload", version: version.servedVersion ?? "" };
    }
    if (status.app === "APK_BEHIND" && info?.app.latest) {
      return { kind: "release", version: info.app.latest };
    }

    return undefined;
  }

  function appHint(): CardModel["hint"] {
    if (status.app === "RELOAD" && version.servedVersion) {
      return { key: "versions.hint.reload", version: version.servedVersion };
    }
    if (status.app === "APK_BEHIND" && info?.app.latest) {
      return { key: "versions.hint.apkBehind", version: info.app.latest };
    }
    if (status.app === "DEPLOY_PENDING" && info?.app.latest) {
      return { key: "versions.hint.appPending", version: info.app.latest };
    }

    return undefined;
  }

  function releasesOf(service: Service): ReleaseEntity[] {
    return service === "api" ? apiReleases : appReleases;
  }

  function runningOf(service: Service): string {
    return service === "api"
      ? (info?.api.current ?? dash)
      : version.runningVersion;
  }

  const changesService = changes ?? "app";
  const allReleases =
    (changesService === "api" ? info?.api.releases : info?.app.releases) ?? [];
  const oldest = allReleases[allReleases.length - 1];
  const changesRunning = runningOf(changesService);
  const checked = timeAgo(version.checkedAt, Date.now());

  return {
    cards: [appCard, apiCard],
    changes: changes
      ? {
          latestUrl:
            (changes === "api" ? info?.api.latestUrl : info?.app.latestUrl) ??
            null,
          releases: releasesOf(changes).map((release) => ({
            ...release,
            date: formatDate(release.publishedAt, localeTag) ?? dash,
          })),
          running: changesRunning,
          service: changes,
          truncated:
            allReleases.length >= MAX_RELEASES &&
            oldest !== undefined &&
            newerReleases([oldest], changesRunning).length > 0,
        }
      : null,
    checked,
    environment: info?.environment ?? null,
    isChecking: version.isChecking,
    onAction: (service: Service) => {
      const card = service === "app" ? appCard : apiCard;
      if (card.action?.kind === "reload") {
        reloadApp();
      } else if (card.action?.kind === "release" && info?.app.latestUrl) {
        void Linking.openURL(info.app.latestUrl);
      }
    },
    onBack: () => setChanges(null),
    onCheckNow: async () => version.checkNow(),
    onClose: () => router.back(),
    onOpenGithub: (url: string) => void Linking.openURL(url),
    onWhatChanged: (service: Service) => setChanges(service),
  };
}

export default useVersionsViewModel;
export type { CardField, CardModel, Service };
