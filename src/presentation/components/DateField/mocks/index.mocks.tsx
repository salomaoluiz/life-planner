import { render } from "@tests";

import { DateField } from "@components";
import * as i18n from "@presentation/i18n";

const onChange = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof DateField>> = {}) {
  jest.mocked(i18n.useLocaleTag).mockReturnValue("pt-BR");
  render(
    <DateField
      clearLabel="Clear"
      label="Date"
      onChange={onChange}
      placeholder="Choose a date"
      testID="date"
      todayLabel="Today"
      yesterdayLabel="Yesterday"
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setup };
