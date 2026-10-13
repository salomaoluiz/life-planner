import { render } from "@tests";

import { AmountInput } from "@components";
import * as i18n from "@presentation/i18n";

const onChange = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof AmountInput>> = {}) {
  jest.mocked(i18n.useLocaleTag).mockReturnValue("pt-BR");
  render(
    <AmountInput
      label="Amount"
      onChange={onChange}
      testID="amount"
      value={0}
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setup };
