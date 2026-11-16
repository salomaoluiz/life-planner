import { render } from "@tests";

import { DonutChart } from "@components";

const onSelect = jest.fn();
const slices = [
  { color: "#4F5BD5", id: "BR_STOCK", label: "Stocks", value: 34 },
  { color: "#F29A4A", id: "BR_REIT", label: "REITs", value: 18 },
  { color: "#1E9B9C", id: "FOREIGN_STOCK", label: "Foreign", value: 22 },
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
