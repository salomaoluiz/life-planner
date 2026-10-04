import { hasText, render } from "@tests";

import ListHeader from "./index.web";

it("SHOULD render the column titles on web", () => {
  render(<ListHeader />);

  expect(hasText("Date")).toBe(true);
  expect(hasText("Description")).toBe(true);
  expect(hasText("Category")).toBe(true);
  expect(hasText("Value")).toBe(true);
});
