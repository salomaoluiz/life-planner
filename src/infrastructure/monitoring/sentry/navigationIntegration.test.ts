import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

import navigationIntegration from "./navigationIntegration";

const navigationIntegrationResponse = {
  name: "NavigationIntegration",
  registerNavigationContainer: jest.fn(),
};

const reactNavigationIntegrationSpy = jest
  .spyOn(Sentry, "reactNavigationIntegration")
  .mockReturnValueOnce(navigationIntegrationResponse);

it("SHOULD call Sentry.reactNavigationIntegration", () => {
  const result = navigationIntegration();

  expect(reactNavigationIntegrationSpy).toHaveBeenCalledTimes(1);
  expect(reactNavigationIntegrationSpy).toHaveBeenCalledWith({
    enableTimeToInitialDisplay: false,
  });
  expect(result).toEqual(navigationIntegrationResponse);
});
