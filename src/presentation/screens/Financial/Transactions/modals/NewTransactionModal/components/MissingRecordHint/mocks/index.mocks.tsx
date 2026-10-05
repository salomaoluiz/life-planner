import { render } from "@tests";

import MissingRecordHint from "../";

const onCreate = jest.fn();

function setup() {
  render(
    <MissingRecordHint
      actionLabel={"Create account"}
      message={"No accounts yet."}
      onCreate={onCreate}
    />,
  );

  return { onCreate };
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup };
