import * as googleOAuth from "@infrastructure/googleOAuth";
import * as Fetcher from "@infrastructure/fetcher";
import { View } from "react-native";
import { render } from "@tests";
import InfrastructureProvider from "@infrastructure/provider";

jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/googleOAuth");

const initializeGoogleOAuthSpy = jest.spyOn(googleOAuth, "initialize");

jest
  .spyOn(Fetcher, "FetcherProvider")
  .mockImplementation(({ children }) => (
    <View testID={"fetcher-provider"}>{children}</View>
  ));

function Children() {
  return <View testID={"infrastructure-children"} />;
}

function setup() {
  return render(
    <InfrastructureProvider>
      <Children />
    </InfrastructureProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

const spies = {
  initializeGoogleOAuth: initializeGoogleOAuthSpy,
};

export { spies, setup };
export { screen } from "@tests";
