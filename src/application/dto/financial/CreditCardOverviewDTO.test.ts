import CreditCardDTO from "./CreditCardDTO";
import CreditCardOverviewDTO, { InvoiceDTO } from "./CreditCardOverviewDTO";
import { overviewEntity } from "./mocks/CreditCard.mocks";

it("SHOULD map the aggregate and every summary to DTOs", () => {
  const dto = CreditCardOverviewDTO.fromEntity(overviewEntity);

  expect(dto.aggregate).toEqual({
    available: 500000,
    totalLimit: 500000,
    used: 0,
  });
  expect(dto.cards).toHaveLength(1);
  expect(dto.cards[0].card).toBeInstanceOf(CreditCardDTO);
  expect(dto.cards[0].card.title).toBe("Main card");
  expect(dto.cards[0].openInvoice).toBeInstanceOf(InvoiceDTO);
  expect(dto.cards[0].openInvoice.paymentAfterDue).toBe(false);
  expect(dto.cards[0].closedInvoices[0].referenceMonth).toBe("2026-10");
});
