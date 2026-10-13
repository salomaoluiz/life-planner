import { render } from "@tests";

import MonthPickerSheet from "../";

const months = Array.from({ length: 12 }, (_, index) => ({
  label: `M${index + 1}`,
  value: String(index),
}));

const handlers = {
  onClose: jest.fn(),
  onSelect: jest.fn(),
  onYearChange: jest.fn(),
};

function setup(
  props: Partial<React.ComponentProps<typeof MonthPickerSheet>> = {},
) {
  render(
    <MonthPickerSheet
      closeLabel={"Close"}
      months={months}
      nextYearLabel={"Next year"}
      previousYearLabel={"Previous year"}
      title={"Choose month"}
      year={2026}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { months, setup };
