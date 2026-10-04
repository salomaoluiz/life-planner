import { List } from "react-native-paper";

import { fireEvent, render, screen } from "@tests";

import { Avatar } from "@components";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import FamilyCard from "../";
import { makeFamilyViewModel } from "../../../mocks/index.mocks";

jest.mock("@screens/Family/containers/FamilyMemberCard", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: (props: { member: unknown }) => (
      <MockView testID="memberCard" {...props} />
    ),
  };
});

// region mocks
const callbacks = {
  onAddNewFamilyMember: jest.fn(),
  onDeleteFamily: jest.fn(),
  refetchFamilies: jest.fn(),
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: { expanded?: boolean; family?: FamilyViewModel }) {
  const family = props?.family ?? makeFamilyViewModel();
  render(
    <FamilyCard addMemberLabel="Add member" family={family} {...callbacks} />,
  );

  if (props?.expanded) {
    fireEvent.press(screen.UNSAFE_getByType(List.Accordion));
  }

  return { family };
}

const mocks = { Avatar, callbacks };

export { mocks, setup };
export { fireEvent, hasText, screen } from "@tests";
