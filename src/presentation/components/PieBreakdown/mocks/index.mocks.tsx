import { render } from "@tests";

import { PieBreakdown } from "@components";

const onPress = jest.fn();
const rows = [
  { id: "a", label: "Groceries", percent: "60%", ratio: 1, value: "R$ 600,00" },
  { id: "b", label: "Rent", percent: "30%", ratio: 0.5, value: "R$ 300,00" },
  {
    id: "other",
    label: "Other",
    muted: true,
    percent: "10%",
    ratio: 0.2,
    value: "R$ 100,00",
  },
];

function setup(props: Partial<React.ComponentProps<typeof PieBreakdown>> = {}) {
  render(
    <PieBreakdown onPress={onPress} rows={rows} testID="pie" {...props} />,
  );
}

export { onPress, setup };
