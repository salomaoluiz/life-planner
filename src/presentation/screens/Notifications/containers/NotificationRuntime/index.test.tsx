import { render } from "@tests";

import useNotificationRuntime from "@screens/Notifications/hooks/useNotificationRuntime";

import NotificationRuntime from "./";

jest.mock("@screens/Notifications/hooks/useNotificationRuntime");

it("SHOULD start the runtime AND render nothing", () => {
  const { toJSON } = render(<NotificationRuntime />);

  expect(useNotificationRuntime).toHaveBeenCalledTimes(1);
  expect(toJSON()).toBeNull();
});
