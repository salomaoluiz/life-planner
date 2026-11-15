import { render } from "@tests";

import { TickerAutocomplete, TickerAutocompleteProps } from "@components";

const baseProps: TickerAutocompleteProps = {
  label: "Ticker",
  onChangeText: jest.fn(),
  onSelect: jest.fn(),
  suggestions: [
    {
      badge: "FII",
      exchange: "B3",
      name: "Kinea Renda Imobiliária",
      priceText: "R$ 152,30",
      ticker: "KNRI11",
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
