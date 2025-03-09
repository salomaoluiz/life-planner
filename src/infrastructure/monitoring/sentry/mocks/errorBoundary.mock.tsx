import * as Sentry from "@sentry/react-native";
import { View } from "react-native";
import { render } from "@tests";
import { SentryErrorBoundary } from "@infrastructure/monitoring/sentry";

// #region mock

jest.mock("@sentry/react-native", () => ({
  ErrorBoundary: jest.fn(),
}));

function Children() {
  return <View testID={"mocked-children"} />;
}

function FallbackComponent(props: { error: unknown; retry: () => void }) {
  return <View {...props} testID={"mocked-fallback"} />;
}

// #endregion mock

jest.spyOn(Sentry, "ErrorBoundary").mockImplementation(
  (props) =>
    (
      <View {...props} testID={"sentry-error-boundary"}>
        {props.children as never}
      </View>
    ) as never,
);

function setup() {
  render(
    <SentryErrorBoundary FallbackComponent={FallbackComponent}>
      <Children />
    </SentryErrorBoundary>,
  );
}

const mocks = {
  FallbackComponent,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup };
export { screen } from "@tests";
