import { View } from "react-native";

import { render } from "@tests";

import { I18NProvider } from "../";
import * as reactI18N from "../react-i18n";

// region Mocks

jest.mock("@presentation/i18n/react-i18n");
jest.unmock("@presentation/i18n");

// endregion Mocks

// region Spies

jest
  .spyOn(reactI18N, "ReactI18NPProvider")
  .mockImplementation(({ children }) => (
    <View testID="react-i18n-provider">{children}</View>
  ));
// endregion Spies

function setup() {
  render(I18NProvider({ children: <View testID="i18n-provider-children" /> }));
}

const spies = {};

export { setup, spies };
export { screen } from "@tests";
