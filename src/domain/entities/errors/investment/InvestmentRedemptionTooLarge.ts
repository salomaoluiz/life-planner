import BusinessError from "@domain/entities/errors/common/BusinessError";

// Spec 105 FR 20-21: a redemption is larger than the title (422). `availableNet` is the cents the title is worth on
// the date (preview and create); `date` is the redemption that stopped fitting after an edit.
class InvestmentRedemptionTooLarge extends BusinessError {
  availableNet: null | number;
  date: null | string;

  constructor(options: { availableNet?: null | number; date?: null | string }) {
    super();
    this.name = "InvestmentRedemptionTooLarge";
    this.availableNet = options.availableNet ?? null;
    this.date = options.date ?? null;
  }
}

export default InvestmentRedemptionTooLarge;
