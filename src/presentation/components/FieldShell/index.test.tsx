import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD render the label above the field", () => {
  setup();

  expect(screen.getByTestId("shell-label").props.children).toBe("Name");
  expect(screen.getByText("field")).toBeTruthy();
});

it("SHOULD show the helper WHEN there is no error", () => {
  setup({ helper: "Use your legal name" });

  expect(screen.getByTestId("shell-helper").props.children).toBe(
    "Use your legal name",
  );
});

it("SHOULD show only the error, announced, WHEN both error and helper exist", () => {
  setup({ error: "Required", helper: "Use your legal name" });

  const error = screen.getByTestId("shell-error");

  expect(error.props.children).toBe("Required");
  expect(error.props.accessibilityLiveRegion).toBe("polite");
  expect(screen.queryByTestId("shell-helper")).toBeNull();
});

it("SHOULD omit the label WHEN absent", () => {
  setup({ label: undefined });

  expect(screen.queryByTestId("shell-label")).toBeNull();
});
