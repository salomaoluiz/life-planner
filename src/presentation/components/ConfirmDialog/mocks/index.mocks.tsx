import { render } from "@tests";

import { ConfirmDialog } from "@components";

const onCancel = jest.fn();
const onConfirm = jest.fn();

function setup(
  props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {},
) {
  render(
    <ConfirmDialog
      cancelLabel="Cancel"
      closeLabel="Close"
      confirmLabel="Delete"
      message="This cannot be undone."
      onCancel={onCancel}
      onConfirm={onConfirm}
      testID="dialog"
      title="Delete Milk?"
      visible
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onCancel, onConfirm, setup };
