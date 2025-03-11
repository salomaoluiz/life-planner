import { screen, setup, spies } from "./mocks/index.mocks";
import GoogleLogo from "@assets/svgs/GoogleLogo.svg";

it("SHOULD render correctly", () => {
  setup();

  const button = screen.getByTestId("login_googleButton");

  expect(button).toBeOnTheScreen();
  expect(button).toHaveTextContent("login.button.googleLogin");
  expect(button.props.buttonColor).toEqual("#FFFFFF");
  expect(button.props.textColor).toEqual("#1F1F1F");
  expect(button.props.icon()).toEqual(<GoogleLogo height={20} width={20} />);
  expect(button.props.mode).toEqual("outlined");
});

it("SHOULD call onPress when button is pressed", () => {
  setup();

  const button = screen.getByTestId("login_googleButton");

  button.props.onPress();

  expect(spies.onPress).toHaveBeenCalledTimes(1);
});
