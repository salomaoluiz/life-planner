import * as reactQuery from "@tanstack/react-query";
import { View } from "react-native";
import { render } from "@tests";
import { ReactQueryProvider } from "@infrastructure/fetcher/reactQuery";

jest
  .spyOn(reactQuery, "QueryClientProvider")
  .mockImplementation(({ children, ...props }) => (
    <View {...props} testID={"query-client-provider"}>
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
    <ReactQueryProvider>
      <Children />
    </ReactQueryProvider>,
  );
}

const spies = {
  QueryClient: reactQuery.QueryClient,
};

export { setup, spies };
export { screen } from "@tests";
