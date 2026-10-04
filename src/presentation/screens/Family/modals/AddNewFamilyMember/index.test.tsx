import { waitFor } from "@tests";

import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";

import {
  fireEvent,
  hasText,
  mocks,
  press,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render the title and actions", () => {
  setup();

  expect(hasText("Add the user email")).toBe(true);
  expect(
    screen.UNSAFE_getAllByProps({ label: "Invite" }).length,
  ).toBeGreaterThan(0);
  expect(
    screen.UNSAFE_getAllByProps({ label: "Cancel" }).length,
  ).toBeGreaterThan(0);
});

it("SHOULD configure the invite mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["invite_member"],
    fetch: mocks.useCases.inviteFamilyMemberUseCase.execute,
  });
});

it("SHOULD invite the typed email to the family from the route WHEN Invite is pressed", () => {
  const { mutate } = setup();

  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ value: "" })[0],
    "bob@example.test",
  );
  press("Invite");

  expect(mutate).toHaveBeenCalledWith({
    email: "bob@example.test",
    familyId: "family-1",
  });
});

it("SHOULD go back WHEN Cancel is pressed", () => {
  setup();

  press("Cancel");

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN the backdrop is pressed", () => {
  setup();

  fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT show feedback WHEN there is no invite data", () => {
  setup();

  expect(spies.encode).not.toHaveBeenCalled();
  expect(spies.push).not.toHaveBeenCalled();
});

it("SHOULD navigate to the success feedback with the invite url WHEN the invite was created", async () => {
  setup({ inviteToken: "token-123" });

  await waitFor(() => expect(spies.push).toHaveBeenCalledTimes(1));

  expect(spies.encode).toHaveBeenCalledWith({
    closeButton: {
      action: FeedbackActions.NAVIGATION,
      route: "/family",
      type: FeedbackNavigationTypes.DISMISS_TO,
    },
    message: "The user  has been invited to the family",
    primaryButton: {
      action: FeedbackActions.COPY_TO_CLIPBOARD,
      label: "Copy Url",
      value: expect.stringMatching(/\/invite\?token=token-123$/),
    },
    title: "Invite sent",
    type: FeedbackType.Success,
  });
  expect(spies.push).toHaveBeenCalledWith({
    params: { feedback: "encoded-feedback" },
    pathname: "/business_feedback",
  });
});
