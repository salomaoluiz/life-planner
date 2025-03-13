import { View } from "react-native";

import { render } from "@tests";

import ApplicationProviders from "@application/providers";
import * as userProviders from "@application/providers/user";

jest
  .spyOn(userProviders, "UserProvider")
  .mockImplementation(({ children }) => (
    <View testID={"user-provider"}>{children}</View>
  ));

function Children() {
  return <View testID={"application-providers-children"} />;
}

function setup() {
  render(
    <ApplicationProviders>
      <Children />
    </ApplicationProviders>,
  );
}

export { setup };
export { screen } from "@tests";
