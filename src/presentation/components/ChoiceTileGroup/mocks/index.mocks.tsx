import { render } from "@tests";

import ChoiceTileGroup, { ChoiceTileGroupProps } from "../index";

const defaultProps: ChoiceTileGroupProps = {
  label: "Type",
  onChange: jest.fn(),
  options: [
    { icon: "bank", label: "Checking", value: "CHECKING" },
    { icon: "piggy-bank", label: "Savings", value: "SAVINGS" },
    { icon: "chart-line", label: "Brokerage", value: "BROKERAGE" },
  ],
  testID: "types",
  value: "SAVINGS",
};

function setup(props?: Partial<ChoiceTileGroupProps>) {
  return render(<ChoiceTileGroup {...defaultProps} {...props} />);
}

export { defaultProps, setup };
