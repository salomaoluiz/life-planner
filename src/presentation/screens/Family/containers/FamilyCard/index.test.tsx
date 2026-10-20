import { fireEvent, render, screen } from "@tests";

import {
  makeArchivedFamilyViewModel,
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
    blockers: undefined,
    confirm: undefined,
    confirmCopy: undefined,
    isBusy: false,
    menu: undefined,
    notice: undefined,
    onCancelConfirm: jest.fn(),
    onCloseBlockers: jest.fn(),
    onCloseMenu: jest.fn(),
    onCloseNotice: jest.fn(),
    onConfirm: jest.fn(),
    onDeleteInline: jest.fn(),
    onFamilyOptions: jest.fn(),
    onInviteMember: jest.fn(),
    onMemberOptions: jest.fn(),
    onMenuAction: jest.fn(),
    onMenuSecondaryAction: jest.fn(),
    onReactivate: jest.fn(),
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

  expect(screen.getByTestId("family.card.toggle-family-1")).toBeOnTheScreen();
  expect(screen.getByTestId("family.card.title-family-1")).toBeOnTheScreen();
  expect(screen.queryByTestId("family.card.member-member-2")).toBeNull();
  expect(screen.queryByTestId("family.card.invite-button-family-1")).toBeNull();
});

it("SHOULD show rows, badges, options and invite WHEN expanded as owner", () => {
  const { vm } = setup();

  expect(screen.getByTestId("family.card.member-member-1")).toBeOnTheScreen();
  expect(screen.getByTestId("family.card.member-member-2")).toBeOnTheScreen();
  expect(screen.getByTestId("family.card.member-member-3")).toBeOnTheScreen();
  expect(
    screen.getByTestId("family.card.member-member-1-badge"),
  ).toBeOnTheScreen();
  expect(
    screen.queryByTestId("family.card.member-member-1-options"),
  ).toBeNull();
  expect(
    screen.getByTestId("family.card.member-member-2-options"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("family.card.member-member-3-options"),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("family.card.invite-button-family-1"));

  expect(vm.onInviteMember).toHaveBeenCalledTimes(1);
});

it("SHOULD hide row options and invite BUT keep the header options FOR a member", () => {
  const { vm } = setup({ family: makeFamilyViewModel(memberViewer) });

  expect(
    screen.queryByTestId("family.card.member-member-2-options"),
  ).toBeNull();
  expect(
    screen.queryByTestId("family.card.member-member-3-options"),
  ).toBeNull();
  expect(screen.queryByTestId("family.card.invite-button-family-1")).toBeNull();

  fireEvent.press(screen.getByTestId("family.card.options-family-1"));

  expect(vm.onFamilyOptions).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the header options FOR a member without own row", () => {
  setup({
    family: makeFamilyViewModel({ isFamilyOwner: false, userId: "user-9" }),
  });

  expect(screen.queryByTestId("family.card.options-family-1")).toBeNull();
});

it("SHOULD call onToggle WHEN the header is pressed", () => {
  const { onToggle } = setup();

  fireEvent.press(screen.getByTestId("family.card.toggle-family-1"));

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

  fireEvent.press(screen.getByTestId("family.card.menu-family-1-action"));

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

  fireEvent.press(screen.getByTestId("family.card.confirm-family-1-confirm"));

  expect(vm.onConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD show the blocked notice AND close it with OK", () => {
  const { vm } = setup({ vm: { notice: "DELETE_BLOCKED" } });

  expect(screen.getByText("family.deleteBlocked.title")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("family.card.notice-family-1-ok"));

  expect(vm.onCloseNotice).toHaveBeenCalledTimes(1);
});

it("SHOULD title the current user row with the You key", () => {
  setup({ family: makeFamilyViewModel(memberViewer) });

  expect(
    screen.UNSAFE_getByProps({ testID: "family.card.member-member-2" }).props
      .title,
  ).toBe("family.card.you");
});

describe("archived family (spec 042)", () => {
  it("SHOULD show the chip, no invite, AND Reactivate / Delete for the owner", () => {
    const { vm } = setup({ family: makeArchivedFamilyViewModel(ownerViewer) });

    expect(
      screen.getByTestId("family.card.archived-chip-family-1"),
    ).toBeOnTheScreen();
    expect(
      screen.queryByTestId("family.card.invite-button-family-1"),
    ).toBeNull();
    expect(screen.queryByTestId("family.card.options-family-1")).toBeNull();
    expect(
      screen.queryByTestId("family.card.member-member-2-options"),
    ).toBeNull();

    fireEvent.press(
      screen.getByTestId("family.card.reactivate-button-family-1"),
    );
    fireEvent.press(screen.getByTestId("family.card.delete-button-family-1"));

    expect(vm.onReactivate).toHaveBeenCalledTimes(1);
    expect(vm.onDeleteInline).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show no owner actions to a member, keeping the options menu to leave", () => {
    setup({ family: makeArchivedFamilyViewModel(memberViewer) });

    expect(
      screen.queryByTestId("family.card.reactivate-button-family-1"),
    ).toBeNull();
    expect(
      screen.getByTestId("family.card.options-family-1"),
    ).toBeOnTheScreen();
  });

  it("SHOULD offer Archive in the action sheet", () => {
    const { vm } = setup({
      vm: {
        menu: {
          actionLabelKey: "family.delete.confirm",
          kind: "FAMILY",
          secondaryLabelKey: "family.archive.action",
          subtitle: "Test Family",
          titleKey: "family.card.options",
        },
      },
    });

    fireEvent.press(
      screen.getByTestId("family.card.menu-family-1-archive-action"),
    );

    expect(vm.onMenuSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it("SHOULD list every kind of blocker in the dialog", () => {
    setup({
      vm: {
        blockers: {
          installmentPlans: [
            { description: "Fridge", id: "plan-1", remainingInstallments: 3 },
          ],
          invoices: [
            {
              amountDue: 15000,
              creditCardId: "card-1",
              creditCardName: "House card",
              month: "2026-10",
            },
          ],
          pendingInvites: [{ email: "test@example.com", id: "invite-1" }],
          recurrences: [
            {
              description: "Rent",
              id: "rec-1",
              nextOccurrenceDate: "2026-11-05",
            },
          ],
          unpaidTransactions: [
            {
              date: "2026-10-10",
              description: "Power",
              id: "tx-1",
              value: 23000,
            },
          ],
        },
      },
    });

    expect(screen.getByTestId("pending-item-rec-1")).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-plan-1")).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-card-1-2026-10")).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-tx-1")).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-invite-1")).toBeOnTheScreen();
  });
});
