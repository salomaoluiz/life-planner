import { render } from "@tests";

import { DonutChart } from "@components";

const onSelect = jest.fn();
const slices = [
  { id: "BR_STOCK", label: "Stocks", swatch: "#4F5BD5", value: 34 },
  { id: "BR_REIT", label: "REITs", swatch: "#F29A4A", value: 18 },
  { id: "FOREIGN_STOCK", label: "Foreign", swatch: "#1E9B9C", value: 22 },
];

function setup(props: Partial<React.ComponentProps<typeof DonutChart>> = {}) {
  return render(
    <DonutChart
      accessibilityLabel="Allocation by class"
      centerLabel="Total"
      centerValue="R$ 184 mil"
      onSelect={onSelect}
      slices={slices}
      testID="donut"
      {...props}
    />,
  );
}

export { onSelect, setup, slices };
