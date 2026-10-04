import { render, screen } from "@tests";

import ListHeader from "./";

it("SHOULD render nothing on native", () => {
  render(<ListHeader />);

  expect(screen.toJSON()).toBeNull();
});
