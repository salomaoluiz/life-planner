import { View } from "react-native";

import { FetcherProvider } from "@infrastructure/fetcher";
import * as reactQuery from "@infrastructure/fetcher/reactQuery";
import { render } from "@tests";

jest.mock("@infrastructure/fetcher/reactQuery");

jest
  .spyOn(reactQuery, "ReactQueryProvider")
  .mockImplementation(({ children, ...props }) => (
    <View {...props} testID={"react-query-provider"}>
      {children}
    </View>
  ));

function Children() {
  return <View testID={"react-query-children"} />;
}

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(
    <FetcherProvider>
      <Children />
    </FetcherProvider>,
  );
}

export { setup };
export { screen } from "@tests";
