import { render } from "@tests";

import Stepper, { StepperProps } from "../index";

const props: StepperProps = {
  accessibilityLabel: "Step 2 of 4: Columns",
  current: 1,
  steps: [
    { label: "File" },
    { label: "Columns" },
    { label: "Values" },
    { label: "Review" },
  ],
  testID: "stepper",
};

function setup(overrides: Partial<StepperProps> = {}) {
  return render(<Stepper {...props} {...overrides} />);
}

export { setup };
