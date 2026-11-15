import { render } from "@tests";

import { DonutChart } from "@components";

function setup(props: Partial<React.ComponentProps<typeof DonutChart>> = {}) {
  render(
    <DonutChart
      accessibilityLabel="Ações BR 60%, FIIs 40%"
      centerLabel="Total"
      centerValue="R$ 184,3 mil"
      slices={[
        { color: "#4F5BD5", share: 0.6, testID: "slice-br" },
        { color: "#F29A4A", share: 0.4, testID: "slice-fiis" },
      ]}
      testID="donut"
      {...props}
    />,
  );
}

export { setup };
