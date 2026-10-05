import { render } from "@tests";

import TreeItem from "../index";

const defaultProps = { depth: 0, testID: "tree-item", title: "Food" };

function setup(props?: Partial<React.ComponentProps<typeof TreeItem>>) {
  return render(<TreeItem {...defaultProps} {...props} />);
}

export { defaultProps, setup };
