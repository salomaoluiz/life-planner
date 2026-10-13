import { render } from "@tests";

import IconChoiceGroup, { IconChoiceGroupProps } from "../index";

const defaultProps: IconChoiceGroupProps = {
  label: "Icon",
  onChange: jest.fn(),
  options: [
    { label: "folder", value: "folder" },
    { label: "food", value: "food" },
    { label: "car", value: "car" },
  ],
  testID: "icons",
  value: "food",
};

function setup(props?: Partial<IconChoiceGroupProps>) {
  return render(<IconChoiceGroup {...defaultProps} {...props} />);
}

export { defaultProps, setup };
