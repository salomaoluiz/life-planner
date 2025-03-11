import { render } from "@tests";
import GoogleButton from "../";

const onPressSpy = jest.fn();

function setup() {
  render(<GoogleButton onPress={onPressSpy} />);
}

const spies = {
  onPress: onPressSpy,
};

export { setup, spies };
export { screen } from "@tests";
