import { StyleSheet } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { Avatar } from "@components";
import { lightTheme } from "@presentation/theme/provider";

function style() {
  return StyleSheet.flatten(screen.getByTestId("avatar").props.style);
}

it.each([
  ["sm", 36],
  ["md", 44],
  ["lg", 48],
] as const)("SHOULD size %s to %i", (size, px) => {
  render(<Avatar name="Ana" size={size} testID="avatar" />);
  expect(style()).toEqual(
    expect.objectContaining({
      borderRadius: lightTheme.sizes.borderRadius.full,
      height: px,
      width: px,
    }),
  );
});

it("SHOULD show the first letter uppercased WHEN there is no photo", () => {
  render(<Avatar name="  ana silva" testID="avatar" />);
  expect(screen.getByTestId("avatar-initial").props.children).toBe("A");
});

it("SHOULD show a person icon WHEN the name is empty", () => {
  render(<Avatar name="  " testID="avatar" />);
  expect(screen.getByTestId("avatar-icon")).toBeTruthy();
  expect(screen.queryByTestId("avatar-initial")).toBeNull();
});

it("SHOULD show the photo and fall back to the initial WHEN it fails to load", () => {
  render(
    <Avatar name="Ana" photoUrl="https://example.com/a.png" testID="avatar" />,
  );
  const image = screen.getByTestId("avatar-image");

  expect(image.props.source).toEqual({ uri: "https://example.com/a.png" });
  fireEvent(image, "error");
  expect(screen.queryByTestId("avatar-image")).toBeNull();
  expect(screen.getByTestId("avatar-initial")).toBeTruthy();
});

it("SHOULD render the pending invite with a dashed border and envelope icon", () => {
  render(<Avatar pending testID="avatar" />);
  expect(style().borderStyle).toBe("dashed");
  expect(screen.getByTestId("avatar-icon")).toBeTruthy();
});

it("SHOULD keep the legacy sized variants", () => {
  expect(typeof Avatar.Large).toBe("function");
  expect(typeof Avatar.Regular).toBe("function");
  expect(typeof Avatar.Small).toBe("function");
});
