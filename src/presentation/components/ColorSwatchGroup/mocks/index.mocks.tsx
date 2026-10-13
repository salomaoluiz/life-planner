import { render } from "@tests";

import ColorSwatchGroup, { ColorSwatchGroupProps } from "../index";

const defaultProps: ColorSwatchGroupProps = {
  customLabel: "Custom",
  label: "Color",
  onChange: jest.fn(),
  onCustomPress: jest.fn(),
  options: [
    { label: "Amber", value: "#F59E0B" },
    { label: "Red", value: "#EF4444" },
    { label: "Indigo", value: "#6366F1" },
  ],
  testID: "swatches",
  value: "#6366F1",
};

function setup(props?: Partial<ColorSwatchGroupProps>) {
  return render(<ColorSwatchGroup {...defaultProps} {...props} />);
}

export { defaultProps, setup };
