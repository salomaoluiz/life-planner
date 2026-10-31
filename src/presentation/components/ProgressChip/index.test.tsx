import { render, screen } from "@tests";

import { ProgressChip } from "@components";

it("SHOULD render the label with a spinner as a polite live region", () => {
  render(<ProgressChip label="Saving" testID="chip" />);

  expect(screen.getByText("Saving")).toBeTruthy();
  expect(screen.getByTestId("chip").props.accessibilityLiveRegion).toBe(
    "polite",
  );
});
