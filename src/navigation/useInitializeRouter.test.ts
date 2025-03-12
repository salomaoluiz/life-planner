import { renderHook } from "@tests";

jest.mock("@infrastructure");
jest.mock("@providers/loader");
jest.mock("expo-router");
import * as expoRouter from "expo-router";

import { monitoring } from "@infrastructure";
import * as loaderProvider from "@providers/loader";

import useInitializeRouter from "./useInitializeRouter";

jest.mock("@sentry/react-native", () => ({
  reactNavigationIntegration: jest.fn().mockReturnValue({
    registerNavigationContainer: jest.fn(),
  }),
}));

const initializeMonitoringSpy = jest.spyOn(monitoring, "initializeMonitoring");
jest.spyOn(loaderProvider, "useProviderLoader").mockReturnValue({
  isLoading: true,
  setIsLoading: jest.fn(),
});
const ref = { current: {} };
const useNavigationContainerRefSpy = jest
  .spyOn(expoRouter, "useNavigationContainerRef")
  .mockReturnValue(ref as never);

const setup = () => renderHook(useInitializeRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD initialize monitoring", () => {
  setup();

  expect(initializeMonitoringSpy).toHaveBeenCalledTimes(1);
});

it("SHOULD return isLoading from loader provider", () => {
  const { result } = setup();

  expect(result.current.isLoading).toBe(true);
});

it("SHOULD register navigation container ref", () => {
  useNavigationContainerRefSpy.mockReturnValueOnce(null as never);
  const { rerender } = setup();

  expect(
    monitoring.navigationIntegration.registerNavigationContainer,
  ).not.toHaveBeenCalled();

  rerender(null);

  expect(
    monitoring.navigationIntegration.registerNavigationContainer,
  ).toHaveBeenCalledTimes(1);
  expect(
    monitoring.navigationIntegration.registerNavigationContainer,
  ).toHaveBeenCalledWith(ref);
});
