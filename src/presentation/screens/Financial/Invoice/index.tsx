import { AdaptiveLayout } from "@components";

import { useInvoiceViewModel } from "./hooks";
import { Wide } from "./views";

function InvoiceModal() {
  const vm = useInvoiceViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export { InvoiceModal };
export default InvoiceModal;
