import { render } from "@tests";

import { RecurrenceFrequency } from "@domain/entities/financial/RecurrenceEntity";

import RecurrenceBlock from "../index";

const testIDs = {
  error: "block-error",
  interval: "block-interval",
  intervalDecrease: "block-interval-decrease",
  intervalIncrease: "block-interval-increase",
  preview: "block-preview",
  unit: "block-unit",
};

const defaultProps = {
  frequency: { interval: 2, unit: "MONTH" } as RecurrenceFrequency,
  onChange: jest.fn(),
  startDate: new Date(2026, 10, 12),
  testIDs,
};

function setup(props?: Partial<React.ComponentProps<typeof RecurrenceBlock>>) {
  render(<RecurrenceBlock {...defaultProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup, testIDs };
