import { screen } from "@tests";

import { setup } from "./mocks/index.mocks";

it("SHOULD describe the whole as one accessible image", () => {
  setup();

  expect(screen.getByTestId("donut").props.accessibilityLabel).toBe(
    "Ações BR 60%, FIIs 40%",
  );
  expect(screen.getByTestId("donut").props.accessibilityRole).toBe("image");
});

it("SHOULD draw one dashed arc per slice, in order", () => {
  setup();

  const first = screen.getByTestId("slice-br").props;
  const second = screen.getByTestId("slice-fiis").props;

  expect(first.stroke).toBeDefined();
  expect(first.stroke).not.toEqual(second.stroke);
  expect(first.strokeDasharray).not.toEqual(second.strokeDasharray);
  expect(first.strokeDashoffset ?? 0).toBe(0);
  expect(Number(second.strokeDashoffset)).toBeLessThan(0);
});

it("SHOULD show the center label and value", () => {
  setup();

  expect(screen.getByText("Total")).toBeTruthy();
  expect(screen.getByText("R$ 184,3 mil")).toBeTruthy();
});

it("SHOULD normalize the shares WHEN they do not add up to one", () => {
  setup({ slices: [{ share: 0, swatch: "#4F5BD5", testID: "slice-br" }] });

  expect(screen.getByTestId("slice-br").props.strokeDasharray).toContain("0");
});
