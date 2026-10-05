import { fireEvent, render, screen } from "@tests";

import {
  makeFamilyViewModel,
  ownerViewer,
} from "@screens/Family/mocks/index.mocks";

import useFamilyCardViewModel from "./hooks/useFamilyCardViewModel";
import FamilyCard from "./index";

jest.mock("./hooks/useFamilyCardViewModel");

const memberViewer = { isFamilyOwner: false, userId: "user-2" };

const spies = { useViewModel: jest.mocked(useFamilyCardViewModel) };

function makeVm(
  overrides: Partial<ReturnType<typeof useFamilyCardViewModel>> = {},
) {
  return {
    confirm: undefined,
    confirmCopy: undefined,
    isBusy: false,
    menu: undefined,
    notice: undefined,
    onCancelConfirm: jest.fn(),
    onCloseMenu: jest.fn(),
    onCloseNotice: jest.fn(),
    onConfirm: jest.fn(),
    onFamilyOptions: jest.fn(),
    onInviteMember: jest.fn(),
    onMemberOptions: jest.fn(),
    onMenuAction: jest.fn(),
    ...overrides,
  } as ReturnType<typeof useFamilyCardViewModel>;
}

function setup(options?: {
  expanded?: boolean;
  family?: ReturnType<typeof makeFamilyViewModel>;
  vm?: Partial<ReturnType<typeof useFamilyCardViewModel>>;
}) {
  const vm = makeVm(options?.vm);
  const onToggle = jest.fn();
  spies.useViewModel.mockReturnValue(vm);

  render(
    <FamilyCard
      expanded={options?.expanded ?? true}
      family={options?.family ?? makeFamilyViewModel(ownerViewer)}
      onToggle={onToggle}
    />,
  );

  return { onToggle, vm };
}

it("SHOULD show only the header WHEN collapsed", () => {
  setup({ expanded: false });

  expect(screen.getByTestId("family-card-toggle-family-1")).toBeOnTheScreen();
  expect(screen.queryByTestId("member-row-member-2")).toBeNull();
  expect(screen.queryByTestId("invite-member-family-1")).toBeNull();
});

it("SHOULD show rows, badges, options and invite WHEN expanded as owner", () => {
  const { vm } = setup();

  expect(screen.getByTestId("member-row-member-1")).toBeOnTheScreen();
  expect(screen.getByTestId("member-row-member-2")).toBeOnTheScreen();
  expect(screen.getByTestId("member-row-member-3")).toBeOnTheScreen();
  expect(screen.getByTestId("member-row-member-1-badge")).toBeOnTheScreen();
  expect(screen.queryByTestId("member-row-member-1-options")).toBeNull();
  expect(screen.getByTestId("member-row-member-2-options")).toBeOnTheScreen();
  expect(screen.getByTestId("member-row-member-3-options")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("invite-member-family-1"));

  expect(vm.onInviteMember).toHaveBeenCalledTimes(1);
});

it("SHOULD hide row options and invite BUT keep the header options FOR a member", () => {
  const { vm } = setup({ family: makeFamilyViewModel(memberViewer) });

  expect(screen.queryByTestId("member-row-member-2-options")).toBeNull();
  expect(screen.queryByTestId("member-row-member-3-options")).toBeNull();
  expect(screen.queryByTestId("invite-member-family-1")).toBeNull();

  fireEvent.press(screen.getByTestId("family-card-options-family-1"));

  expect(vm.onFamilyOptions).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the header options FOR a member without own row", () => {
  setup({
    family: makeFamilyViewModel({ isFamilyOwner: false, userId: "user-9" }),
  });

  expect(screen.queryByTestId("family-card-options-family-1")).toBeNull();
});

it("SHOULD call onToggle WHEN the header is pressed", () => {
  const { onToggle } = setup();

  fireEvent.press(screen.getByTestId("family-card-toggle-family-1"));

  expect(onToggle).toHaveBeenCalledTimes(1);
});

it("SHOULD run the menu action FROM the action sheet", () => {
  const { vm } = setup({
    vm: {
      menu: {
        actionLabelKey: "family.delete.confirm",
        kind: "FAMILY",
        subtitle: "Test Family",
        titleKey: "family.card.options",
      },
    },
  });

  fireEvent.press(screen.getByTestId("family-menu-family-1-action"));

  expect(vm.onMenuAction).toHaveBeenCalledTimes(1);
});

it("SHOULD confirm through the dialog", () => {
  const { vm } = setup({
    vm: {
      confirm: { kind: "DELETE_FAMILY" },
      confirmCopy: {
        confirmLabelKey: "family.delete.confirm",
        messageKey: "family.delete.message",
        params: { name: "Test Family" },
        titleKey: "family.delete.title",
      },
    },
  });

  fireEvent.press(screen.getByTestId("family-confirm-family-1-confirm"));

  expect(vm.onConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD show the blocked notice AND close it with OK", () => {
  const { vm } = setup({ vm: { notice: "DELETE_BLOCKED" } });

  expect(screen.getByText("family.deleteBlocked.title")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("family-notice-family-1-ok"));

  expect(vm.onCloseNotice).toHaveBeenCalledTimes(1);
});

it("SHOULD title the current user row with the You key", () => {
  setup({ family: makeFamilyViewModel(memberViewer) });

  expect(
    screen.UNSAFE_getByProps({ testID: "member-row-member-2" }).props.title,
  ).toBe("family.card.you");
});
