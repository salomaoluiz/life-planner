import React from "react";
import { render } from "@tests";

import FamilyCard, { Props } from "../";

// Mock react-native
jest.mock("react-native", () => ({
  View: ({ children, testID, ...props }: any) => (
    <MockedComponent testID={testID ?? "content-container"} {...props}>
      {children}
    </MockedComponent>
  ),
}));

// Mock components
jest.mock("@components", () => ({
  Accordion: {
    Container: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "accordion-container"} {...props} />
    ),
  },
  Avatar: {
    Regular: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "avatar-regular"} {...props} />
    ),
  },
  Spacer: ({ testID }: any) => <MockedComponent testID={testID ?? "spacer"} />,
  Text: {
    Title: ({ testID, ...props }: any) => (
      <MockedComponent testID={testID ?? "family-title"} {...props} />
    ),
  },
}));

// Mock Family components
jest.mock("@screens/Family/components/AddNewFamilyMember", () => ({ testID }: any) => (
  <MockedComponent testID={testID ?? "add-new-family-member"} />
));

jest.mock("@screens/Family/components/DeleteFamily", () => ({ testID }: any) => (
  <MockedComponent testID={testID ?? "delete-family"} />
));

// Mock Family containers
jest.mock("@screens/Family/containers/FamilyMemberCard", () => ({ testID }: any) => (
  <MockedComponent testID={testID ?? "family-member-card"} />
));

// Mock styles
jest.mock("../styles", () => () => ({
  styles: { contentContainer: {} },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

const defaultProps: Props = {
  family: {
    familyName: "Test Family",
    familyMembers: [{ id: "1", name: "Member 1", key: "1" }],
    owner: { memberDto: { id: "owner-1" } },
    avatar: { mode: "text", source: "TF" },
  } as any,
  onAddNewFamilyMember: jest.fn(),
  onDeleteFamily: jest.fn(),
  refetchFamilies: jest.fn(),
};

function setup(props?: Partial<Props>) {
  render(<FamilyCard {...defaultProps} {...props} />);
}

export { defaultProps, setup };