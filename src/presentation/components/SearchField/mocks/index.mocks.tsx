import { render } from "@tests";

import { SearchField } from "@components";

const defaultProps = {
  clearLabel: "Clear",
  onChangeText: jest.fn(),
  placeholder: "Search",
  testID: "search",
  value: "",
};

function setup(props?: Partial<React.ComponentProps<typeof SearchField>>) {
  render(<SearchField {...defaultProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup };
