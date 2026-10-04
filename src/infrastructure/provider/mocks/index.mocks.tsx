import { View } from "react-native";

import { render } from "@tests";

import * as Fetcher from "@infrastructure/fetcher";
import InfrastructureProvider from "@infrastructure/provider";

jest.mock("@infrastructure/fetcher");

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

export { setup };
export { screen } from "@tests";
