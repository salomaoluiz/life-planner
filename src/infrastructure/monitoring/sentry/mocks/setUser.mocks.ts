import * as Sentry from "@sentry/react-native";
import { sentrySetUser } from "@infrastructure/monitoring/sentry";

const setUserSpy = jest.spyOn(Sentry, "setUser");

beforeEach(() => {
  jest.clearAllMocks();
});

const spies = {
  setUser: setUserSpy,
};

function setup(data: Parameters<typeof sentrySetUser>[0]) {
  sentrySetUser(data);
}

export { spies, setup };
