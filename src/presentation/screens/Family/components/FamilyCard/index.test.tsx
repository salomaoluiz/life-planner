import FamilyDTO from "@application/dto/family/FamilyDTO";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import { familyDTO } from "../../mocks/index.mocks";
import { fireEvent, hasText, mocks, screen, setup } from "./mocks/index.mocks";

it("SHOULD render the family name and initials avatar", () => {
  setup();

  expect(hasText("Test Family")).toBe(true);
  expect(screen.UNSAFE_getByType(mocks.Avatar.Regular).props).toMatchObject({
    mode: "text",
    source: "TF",
  });
});

it("SHOULD hide the members and actions WHEN collapsed", () => {
  setup();

  expect(screen.queryAllByTestId("memberCard")).toHaveLength(0);
});

it("SHOULD render a card per member with the owner member id WHEN expanded", () => {
  const { family } = setup({ expanded: true });

  const cards = screen.getAllByTestId("memberCard");
  expect(cards).toHaveLength(2);
  expect(cards[0].props.member).toBe(family.familyMembers[0]);
  expect(cards[0].props.ownerId).toBe("member-1");
});

it("SHOULD render members without an owner id WHEN the family has no owner member", () => {
  const base = setup().family;
  screen.unmount();
  const noOwner = new FamilyViewModel(
    new FamilyDTO({ ...familyDTO, ownerId: "someone-else" }),
    base.familyMembers,
  );

  setup({ expanded: true, family: noOwner });

  expect(screen.getAllByTestId("memberCard")[0].props.ownerId).toBeUndefined();
});

it("SHOULD call onAddNewFamilyMember WHEN the add button is pressed", () => {
  setup({ expanded: true });

  fireEvent.press(
    screen.UNSAFE_getAllByProps({ label: "Add new Family Member" })[0],
  );

  expect(mocks.callbacks.onAddNewFamilyMember).toHaveBeenCalledTimes(1);
});

it("SHOULD call onDeleteFamily WHEN the delete button is pressed", () => {
  setup({ expanded: true });

  fireEvent.press(screen.UNSAFE_getAllByProps({ label: "Delete Family" })[0]);

  expect(mocks.callbacks.onDeleteFamily).toHaveBeenCalledTimes(1);
});
