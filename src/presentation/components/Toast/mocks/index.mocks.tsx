import { render } from "@tests";

import { Toast } from "@components";

const onHide = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof Toast>> = {}) {
  render(
    <Toast
      message="Transaction saved"
      onHide={onHide}
      testID="toast"
      visible
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  onHide.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

const spies = { onHide };

export { setup, spies };
