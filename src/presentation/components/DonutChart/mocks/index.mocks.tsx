import { render } from "@tests";

import { DonutChart } from "@components";

function setup(props: Partial<React.ComponentProps<typeof DonutChart>> = {}) {
  render(
    <DonutChart
      accessibilityLabel="Ações BR 60%, FIIs 40%"
      centerLabel="Total"
      centerValue="R$ 184,3 mil"
      slices={[
        { share: 0.6, swatch: "#4F5BD5", testID: "slice-br" },
        { share: 0.4, swatch: "#F29A4A", testID: "slice-fiis" },
      ]}
      testID="donut"
      {...props}
    />,
  );
}

export { setup };
