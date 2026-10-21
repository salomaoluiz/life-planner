import { render } from "@tests";

import { LineChart } from "@components";

const onSelect = jest.fn();
const points = [
  { label: "Nov", projected: false, value: 1000 },
  { label: "Dec", projected: false, value: 1500 },
  { label: "Jan", projected: true, value: 1200 },
];

function setup(props: Partial<React.ComponentProps<typeof LineChart>> = {}) {
  render(
    <LineChart
      accessibilityLabel="Balance from Nov to Jan"
      formatTick={(value) => `${value}`}
      formatValue={(value) => `R$ ${value}`}
      onSelect={onSelect}
      points={points}
      testID="line"
      {...props}
    />,
  );
}

export { onSelect, points, setup };
