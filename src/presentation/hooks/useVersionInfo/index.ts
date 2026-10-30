import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import { VersionEntity } from "@domain/entities/version/VersionEntity";
import {
  isNewerVersion,
  resolveVersionStatus,
  VersionStatus,
} from "@domain/entities/version/versionStatus";
import { fetchServedWebVersion, getAppInfo } from "@infrastructure/appInfo";
import { useQuery } from "@infrastructure/fetcher";
import { asyncStorage, StorageKeys } from "@infrastructure/storage";

const CACHE_KEY = ["version", "info"];
const POLL_MS = 30 * 60 * 1000;
const STALE_MS = 10 * 60 * 1000;

interface UseVersionInfoResponse {
  /** Build time of the running bundle or APK. */
  appBuiltAt: null | string;
  /** The banner to show: null when there is none or it was dismissed for this version. */
  banner: VersionStatus["banner"];
  checkedAt: null | string;
  checkNow: () => Promise<void>;
  dismiss: () => void;
  info: null | VersionEntity;
  isChecking: boolean;
  platform: ReturnType<typeof getAppInfo>["platform"];
  runningVersion: string;
  servedVersion: null | string;
  status: VersionStatus;
}

function readDismissed(): null | string {
  return asyncStorage.getString(StorageKeys.string.VERSION_BANNER_DISMISSED);
}

// App + API versions and update status (spec 056). React Query shares one request between every
// component that calls it; the web `/version.json` is re-read on the same triggers.
function useVersionInfo(): UseVersionInfoResponse {
  const appInfo = useMemo(() => getAppInfo(), []);
  const forceRefresh = useRef(false);
  const [served, setServed] = useState<Awaited<
    ReturnType<typeof fetchServedWebVersion>
  > | null>(null);
  const [dismissed, setDismissed] = useState<null | string>(readDismissed);
  const query = useQuery<VersionEntity>({
    cacheKey: CACHE_KEY,
    fetch: async () => {
      const refresh = forceRefresh.current;
      forceRefresh.current = false;

      return useCases.getVersionInfoUseCase.execute({ refresh });
    },
    refetchInterval: POLL_MS,
    retry: false,
    staleTime: STALE_MS,
  });
  const { refetch } = query;
  // The fetcher returns a new `refetch` on every render; the AppState effect reads it through a
  // ref so it subscribes once, instead of re-running (and re-reading version.json) every render.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const refreshServed = useCallback(async () => {
    setServed(await fetchServedWebVersion());
  }, []);

  useEffect(() => {
    void refreshServed();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshServed();
        void refetchRef.current();
      }
    });

    return () => subscription.remove();
  }, [refreshServed]);

  const status = useMemo(
    () =>
      resolveVersionStatus({
        appBuiltAt: appInfo.builtAt,
        appVersion: appInfo.version,
        info: query.data ?? null,
        infoFailed: query.status === "error",
        platform: appInfo.platform,
        served,
      }),
    [appInfo, query.data, query.status, served],
  );

  const checkNow = useCallback(async () => {
    forceRefresh.current = true;
    await Promise.all([refetch(), refreshServed()]);
  }, [refetch, refreshServed]);

  const dismiss = useCallback(() => {
    if (!status.banner) {
      return;
    }
    asyncStorage.setString(
      StorageKeys.string.VERSION_BANNER_DISMISSED,
      status.banner.version,
    );
    setDismissed(status.banner.version);
  }, [status.banner]);

  const banner =
    status.banner &&
    (dismissed === null || isNewerVersion(status.banner.version, dismissed))
      ? status.banner
      : null;

  return {
    appBuiltAt: appInfo.builtAt,
    banner,
    checkedAt: query.data?.checkedAt ?? null,
    checkNow,
    dismiss,
    info: query.data ?? null,
    isChecking: query.isFetching,
    platform: appInfo.platform,
    runningVersion: appInfo.version,
    servedVersion: served?.version ?? null,
    status,
  };
}

export default useVersionInfo;
export type { UseVersionInfoResponse };
