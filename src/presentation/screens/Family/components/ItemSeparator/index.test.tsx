import { render, screen } from "@tests";

import ItemSeparator from "./";

it("SHOULD render the separator", () => {
  render(<ItemSeparator />);

  expect(screen.toJSON()).toMatchObject({ type: "View" });
});
