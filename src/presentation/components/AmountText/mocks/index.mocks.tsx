import { render } from "@tests";

import { AmountText } from "@components";
import * as i18n from "@presentation/i18n";

function setup(
  props: Partial<React.ComponentProps<typeof AmountText>> = {},
  locale = "pt-BR",
) {
  jest.mocked(i18n.useLocaleTag).mockReturnValue(locale);
  render(<AmountText testID="amount" value={31290} {...props} />);
}

export { setup };
