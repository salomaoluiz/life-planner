import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { DateChoice } from "./confirmPayState";

// Spec 097: the row to confirm and, on "Try again", what the user had chosen. A module store, not route params: the
// modal opens from the list (row already loaded) and from the error toast on any screen.
interface PayDraft {
  cents: number;
  choice: DateChoice;
  other?: Date;
}

interface PayRequest {
  draft?: PayDraft;
  item: TransactionDTO;
}

let request: PayRequest | undefined;

function clearPayRequest() {
  request = undefined;
}

function getPayRequest() {
  return request;
}

function setPayRequest(next: PayRequest) {
  request = next;
}

export type { PayDraft, PayRequest };
export { clearPayRequest, getPayRequest, setPayRequest };
