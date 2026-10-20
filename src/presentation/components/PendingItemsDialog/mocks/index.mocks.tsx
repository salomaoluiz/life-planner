import { render } from "@tests";

import { PendingItemsDialog } from "@components";

const onClose = jest.fn();

function setup(
  props: Partial<React.ComponentProps<typeof PendingItemsDialog>> = {},
) {
  onClose.mockClear();

  return render(
    <PendingItemsDialog
      bodyLabel="Resolve these items first:"
      closeLabel="Close"
      okLabel="OK"
      onClose={onClose}
      sections={[
        { items: [{ id: "rec-1", label: "Rent" }], title: "Recurrences" },
        { items: [], title: "Empty section" },
        { items: [{ id: "inv-1", label: "House card" }], title: "Invoices" },
        { items: [{ id: "tx-1", label: "Power" }], title: "Unpaid" },
      ]}
      testIDs={{ dialog: "pending-dialog", ok: "pending-ok" }}
      title="Can't archive yet"
      {...props}
    />,
  );
}

const spies = { onClose };

export { setup, spies };
