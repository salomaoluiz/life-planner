import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React from "react";

import { act, renderHook } from "@tests";
import * as network from "@tests/perf/networkHarness";
import respond from "@tests/perf/respond";

import {
  queryClient,
  ReactQueryProvider,
} from "@infrastructure/fetcher/reactQuery";

import type { Report } from "./budgets";
import { countCommits } from "./renderBudget";

// Spec 087: the React commits a screen's view model causes while it mounts (probe component under a Profiler).
async function countHookCommits<T>(
  useViewModel: () => T,
  params: Record<string, string> = {},
) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);

  function Probe() {
    useViewModel();

    return null;
  }

  return countCommits(<Probe />, { settle: flush, wrapper: wrapper as never });
}

async function flush() {
  await network.flush(async (callback) => act(callback));
}

// A GET of the transactions endpoint without a period downloads the whole history.
function fullHistoryCalls() {
  return network.count(
    (path, method) =>
      method === "GET" &&
      path.startsWith("/v1/finance/transactions") &&
      !path.includes("from="),
  );
}

// Mounts the hook(s) a screen mounts (with the route params it receives) and lets every request round settle.
async function openScreen<T>(
  useViewModel: () => T,
  params: Record<string, string> = {},
) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
  const view = renderHook(useViewModel, { wrapper });

  await flush();

  return view;
}

// `PERF_REPORT=1 yarn jest <file>` prints the requests behind a measure (console.log is muted in tests).
function report(label: string): Report {
  const result = { ...network.stats(), fullHistory: fullHistoryCalls() };

  if (process.env.PERF_REPORT) {
    process.stdout.write(
      `${label} ${JSON.stringify(result)}\n  ${network.requests().join("\n  ")}\n`,
    );
  }

  return result;
}

function setupPerf() {
  beforeAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    queryClient.clear();
    jest.requireMock("@infrastructure/storage/init").cache.clearAll();
    jest.mocked(useIsFocused).mockReturnValue(true);
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    network.reset(respond);
  });

  afterEach(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}

export { countHookCommits, flush, openScreen, report, setupPerf, wrapper };
