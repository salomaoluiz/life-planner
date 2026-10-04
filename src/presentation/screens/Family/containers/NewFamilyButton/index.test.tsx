import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import NewFamilyButton from "./";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

it("SHOULD navigate to the add family modal WHEN pressed", () => {
  render(<NewFamilyButton />);

  fireEvent.press(screen.UNSAFE_getAllByProps({ label: "Add New Family" })[0]);

  expect(router.push).toHaveBeenCalledWith("/family/add_new_family");
});
