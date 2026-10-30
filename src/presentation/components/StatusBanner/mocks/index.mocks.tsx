import { fireEvent, render, screen } from "@tests";

import { StatusBanner } from "@components";

const onAction = jest.fn();
const onDismiss = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof StatusBanner>> = {}) {
  jest.clearAllMocks();
  render(
    <StatusBanner
      actionLabel="Reload"
      dismissLabel="Dismiss notice"
      message="A new app version (1.5.0) is live."
      onAction={onAction}
      onDismiss={onDismiss}
      testID="banner"
      {...props}
    />,
  );

  return {
    action: () => screen.getByTestId("banner-action"),
    dismiss: () => screen.getByTestId("banner-dismiss"),
    press: fireEvent.press,
  };
}

const spies = { onAction, onDismiss };

export { setup, spies };
