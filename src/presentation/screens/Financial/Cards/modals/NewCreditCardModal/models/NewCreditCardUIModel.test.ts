import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewCreditCardUIModel from "./NewCreditCardUIModel";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice", type: OwnerType.USER }),
  new OwnerDTO({ id: "fam-1", name: "Family", type: OwnerType.FAMILY }),
];
const model = new NewCreditCardUIModel(owners);

it("SHOULD offer the five brands in order", () => {
  expect(model.brandOptions.map((option) => option.value)).toEqual([
    "VISA",
    "MASTERCARD",
    "ELO",
    "AMEX",
    "OTHER",
  ]);
  expect(model.brandOptions[0].labelKey).toBe("financial.cards.brand.VISA");
});

it("SHOULD offer days 1 to 31, and a leading 'same as due day' option for the payment day", () => {
  expect(model.dayOptions).toHaveLength(31);
  expect(model.dayOptions[0]).toEqual({ label: "1", value: "1" });
  expect(model.dayOptions[30]).toEqual({ label: "31", value: "31" });
  expect(model.paymentDayOptions).toHaveLength(32);
  expect(model.paymentDayOptions[0]).toEqual({
    labelKey: "financial.cardForm.paymentSameAsDue",
    value: "",
  });
});

it("SHOULD expose the 8 palette colors AND the owner choices (Personal first)", () => {
  expect(model.colorOptions).toHaveLength(8);
  expect(model.ownerChoices.map((choice) => choice.value)).toEqual([
    "user-id",
    "fam-1",
  ]);
});

it("SHOULD find an owner by id and fall back to the first", () => {
  expect(model.owner("fam-1").id).toBe("fam-1");
  expect(model.owner("missing").id).toBe("user-id");
});
