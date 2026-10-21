import { render, screen } from "@tests";

import PreviewTable from "./index";

describe("PreviewTable", () => {
  it("SHOULD show the header and every row, padding short rows", () => {
    render(
      <PreviewTable
        headers={["Data", "Valor"]}
        rows={[["02/10/2026", "-1,00"], ["03/10/2026"]]}
        testID={"preview"}
      />,
    );

    ["Data", "Valor", "02/10/2026", "-1,00", "03/10/2026"].forEach((text) =>
      expect(screen.getByText(text)).toBeOnTheScreen(),
    );
    expect(screen.getByTestId("preview-row-1")).toBeOnTheScreen();
  });
});
