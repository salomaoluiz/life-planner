import { render } from "@tests";

import GroupHeader from "../index";

const defaultProps = { testID: "group-header", title: "Today" };

function setup(props?: Partial<React.ComponentProps<typeof GroupHeader>>) {
  return render(<GroupHeader {...defaultProps} {...props} />);
}

export { defaultProps, setup };
