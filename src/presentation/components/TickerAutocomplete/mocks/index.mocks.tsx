import { render } from "@tests";

import { TickerAutocomplete, TickerAutocompleteProps } from "@components";

const baseProps: TickerAutocompleteProps = {
  label: "Ticker",
  onChangeText: jest.fn(),
  onSelect: jest.fn(),
  suggestions: [
    {
      exchange: "B3",
      name: "Itaúsa PN",
      priceText: "R$ 10,53",
      ticker: "ITSA4",
    },
    { name: null, priceText: "R$ 10,61", ticker: "ITSA3" },
  ],
  testID: "tk",
  value: "itsa",
};

function setup(props: Partial<TickerAutocompleteProps> = {}) {
  return render(<TickerAutocomplete {...baseProps} {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { baseProps, setup };
