import * as Sentry from "@sentry/react-native";
import { View } from "react-native";

import { SentryErrorBoundary } from "@infrastructure/monitoring/sentry";
import { render } from "@tests";

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

const beforeCaptureSpy = jest.fn();

function setup() {
  render(
    <SentryErrorBoundary
      beforeCapture={beforeCaptureSpy}
      FallbackComponent={FallbackComponent}
    >
      <Children />
    </SentryErrorBoundary>,
  );
}

const mocks = {
  FallbackComponent,
};

const spies = {
  beforeCapture: beforeCaptureSpy,
};
beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { screen } from "@tests";
