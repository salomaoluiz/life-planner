import { truncateMiddle } from "@screens/Family/utils/inviteLink";

import { fireEvent, hasText, screen, setup, spies } from "./mocks/index.mocks";

const secret = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
const longLink = `https://app.example.test/invite?token=${secret}`;
const result = { link: longLink, resultEmail: "invitee@example.test" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("form state", () => {
  it("SHOULD render the title and the family name as subtitle", () => {
    setup();

    expect(hasText("family.card.invite")).toBe(true);
    expect(hasText("Test Family")).toBe(true);
  });

  it("SHOULD render the email field with the email keyboard AND the helper", () => {
    setup();

    const field = screen.getByTestId("invite-email");

    expect(field.props.keyboardType).toBe("email-address");
    expect(field.props.autoCapitalize).toBe("none");
    expect(hasText("family.member.invite.helper")).toBe(true);
  });

  it("SHOULD call onChangeEmail WHEN typing", () => {
    setup();

    fireEvent.changeText(screen.getByTestId("invite-email"), "a@example.test");

    expect(spies.onChangeEmail).toHaveBeenCalledWith("a@example.test");
  });

  it("SHOULD replace the helper with the error WHEN there is an email error", () => {
    setup({ emailErrorKey: "family.member.invite.alreadyExists" });

    expect(hasText("family.member.invite.alreadyExists")).toBe(true);
    expect(hasText("family.member.invite.helper")).toBe(false);
  });

  it("SHOULD call onSubmit WHEN the submit button is pressed", () => {
    setup();

    fireEvent.press(screen.getByTestId("invite-submit"));

    expect(spies.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show the submit button as busy WHEN submitting", () => {
    setup({ isSubmitting: true });

    expect(
      screen.getByTestId("invite-submit").props.accessibilityState,
    ).toMatchObject({ busy: true });
  });

  it("SHOULD render the generic error WHEN hasGenericError", () => {
    setup({ hasGenericError: true });

    expect(hasText("common.errors.generic")).toBe(true);
  });

  it("SHOULD NOT render any copy, share or done action", () => {
    setup();

    expect(screen.queryByTestId("invite-copy")).toBeNull();
    expect(screen.queryByTestId("invite-share")).toBeNull();
    expect(screen.queryByTestId("invite-done")).toBeNull();
  });

  it("SHOULD call onClose WHEN the sheet is closed", () => {
    setup();

    fireEvent.press(screen.getAllByLabelText("common.actions.close")[0]);

    expect(spies.onClose).toHaveBeenCalledTimes(1);
  });
});

describe("result state", () => {
  it("SHOULD NOT render the email field", () => {
    setup(result);

    expect(screen.queryByTestId("invite-email")).toBeNull();
    expect(screen.queryByTestId("invite-submit")).toBeNull();
  });

  it("SHOULD render the success title AND the message with the email", () => {
    setup(result);

    expect(hasText("family.member.invite.successTitle")).toBe(true);
    expect(
      hasText(
        `family.member.invite.successMessage {"email":"invitee@example.test"}`,
      ),
    ).toBe(true);
  });

  it("SHOULD render the link truncated AND never the full secret", () => {
    setup(result);

    const text = screen.getByTestId("invite-link").props.children;

    expect(text).toBe(truncateMiddle(longLink, 36));
    expect(text).not.toContain(secret);
  });

  it("SHOULD call onCopy WHEN the copy button is pressed", () => {
    setup(result);

    fireEvent.press(screen.getByTestId("invite-copy"));

    expect(spies.onCopy).toHaveBeenCalledTimes(1);
    expect(hasText("family.member.invite.copyLink")).toBe(true);
  });

  it("SHOULD show Copied WHEN copied", () => {
    setup({ ...result, copied: true });

    expect(hasText("family.member.invite.copied")).toBe(true);
    expect(hasText("family.member.invite.copyLink")).toBe(false);
  });

  it("SHOULD render the share button only WHEN sharing is available", () => {
    setup(result);
    fireEvent.press(screen.getByTestId("invite-share"));

    expect(spies.onShare).toHaveBeenCalledTimes(1);
  });

  it("SHOULD hide the share button WHEN sharing is unavailable", () => {
    setup({ ...result, shareAvailable: false });

    expect(screen.queryByTestId("invite-share")).toBeNull();
  });

  it("SHOULD call onDone WHEN Done is pressed", () => {
    setup(result);

    fireEvent.press(screen.getByTestId("invite-done"));

    expect(spies.onDone).toHaveBeenCalledTimes(1);
  });
});
