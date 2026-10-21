import { render } from "@tests";

import { ColumnChart } from "@components";

const onSelect = jest.fn();
const groups = [
  {
    expense: { projected: 0, realized: 400 },
    income: { projected: 0, realized: 900 },
    label: "Nov",
  },
  {
    expense: { projected: 100, realized: 300 },
    income: { projected: 200, realized: 500 },
    label: "Dec",
  },
];

function setup(props: Partial<React.ComponentProps<typeof ColumnChart>> = {}) {
  render(
    <ColumnChart
      accessibilityLabel="Income and expenses"
      formatTick={(value) => `${value}`}
      formatValue={(value) => `R$ ${value}`}
      groups={groups}
      onSelect={onSelect}
      testID="columns"
      {...props}
    />,
  );
}

export { groups, onSelect, setup };
