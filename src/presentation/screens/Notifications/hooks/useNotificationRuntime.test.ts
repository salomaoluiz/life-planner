import { renderHook, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import { notificationsClient } from "@infrastructure/notifications";

import useNotificationRuntime, {
  resetSeenThrottle,
} from "./useNotificationRuntime";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher", () => ({
  invalidateFetcherData: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    markNotificationDeviceSeenUseCase: {
      execute: jest.fn().mockResolvedValue(undefined),
    },
    markNotificationReadUseCase: {
      execute: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

const client = jest.mocked(notificationsClient);

beforeEach(() => {
  jest.clearAllMocks();
  resetSeenThrottle();
  client.getDeviceId.mockResolvedValue("d-1");
});

it("SHOULD report the device time zone and locale on start", async () => {
  renderHook(() => useNotificationRuntime());

  await waitFor(() =>
    expect(
      useCases.markNotificationDeviceSeenUseCase.execute,
    ).toHaveBeenCalledWith({
      id: "d-1",
      locale: "pt-BR",
      timeZone: "America/Sao_Paulo",
    }),
  );
});

it("SHOULD report at most once an hour AND skip a device that was never registered", async () => {
  const { rerender } = renderHook(() => useNotificationRuntime());
  await waitFor(() =>
    expect(
      useCases.markNotificationDeviceSeenUseCase.execute,
    ).toHaveBeenCalledTimes(1),
  );

  rerender({});
  renderHook(() => useNotificationRuntime());
  await Promise.resolve();

  expect(
    useCases.markNotificationDeviceSeenUseCase.execute,
  ).toHaveBeenCalledTimes(1);

  resetSeenThrottle();
  client.getDeviceId.mockResolvedValue(null);
  renderHook(() => useNotificationRuntime());
  await Promise.resolve();

  expect(
    useCases.markNotificationDeviceSeenUseCase.execute,
  ).toHaveBeenCalledTimes(1);
});

it("SHOULD keep going WHEN the report fails", async () => {
  jest
    .mocked(useCases.markNotificationDeviceSeenUseCase.execute)
    .mockRejectedValueOnce(new Error("offline"));

  renderHook(() => useNotificationRuntime());

  await waitFor(() =>
    expect(
      useCases.markNotificationDeviceSeenUseCase.execute,
    ).toHaveBeenCalled(),
  );
});

it("SHOULD open the target AND mark the notice read WHEN a push is tapped", async () => {
  renderHook(() => useNotificationRuntime());
  const tap = client.onTap.mock.calls[0][0];

  tap({ notificationId: "n-1", route: "/finance/transactions/tx-1" });

  await waitFor(() =>
    expect(useCases.markNotificationReadUseCase.execute).toHaveBeenCalledWith({
      id: "n-1",
    }),
  );
  expect(router.push).toHaveBeenCalledWith({
    params: { id: "tx-1" },
    pathname: "/financial/transaction/add_new_transaction",
  });
});

it("SHOULD open the center for a push without a route AND not mark anything without an id", () => {
  renderHook(() => useNotificationRuntime());

  client.onTap.mock.calls[0][0]({});

  expect(useCases.markNotificationReadUseCase.execute).not.toHaveBeenCalled();
  expect(router.push).toHaveBeenCalledWith({
    params: undefined,
    pathname: "/notifications",
  });
});

it("SHOULD refresh on a foreground push AND on returning to the app, AND stop listening on unmount", () => {
  const remove = jest.fn();
  const add = jest
    .spyOn(AppState, "addEventListener")
    .mockReturnValue({ remove } as never);
  const offTap = jest.fn();
  const offReceive = jest.fn();
  client.onTap.mockReturnValue(offTap);
  client.onReceive.mockReturnValue(offReceive);
  const { unmount } = renderHook(() => useNotificationRuntime());

  client.onReceive.mock.calls[0][0]();
  (add.mock.calls[0][1] as (state: string) => void)("active");
  (add.mock.calls[0][1] as (state: string) => void)("background");
  unmount();

  expect(remove).toHaveBeenCalledTimes(1);
  expect(offTap).toHaveBeenCalledTimes(1);
  expect(offReceive).toHaveBeenCalledTimes(1);
});
