import { render } from "@tests";

import MonthSwitcher from "../";

const handlers = {
  onMonthPress: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
};

function setup(
  props: Partial<React.ComponentProps<typeof MonthSwitcher>> = {},
) {
  render(
    <MonthSwitcher
      monthLabel={"October 2026"}
      nextLabel={"Next month"}
      previousLabel={"Previous month"}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup };
