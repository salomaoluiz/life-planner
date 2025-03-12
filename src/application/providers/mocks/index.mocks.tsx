import { View } from "react-native";

import ApplicationProviders from "@application/providers";
import * as userProviders from "@application/providers/user";
import { render } from "@tests";

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
