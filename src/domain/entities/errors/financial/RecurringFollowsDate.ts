import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when an invoice is chosen for a recurring card transaction: it follows the date (spec 095).
class RecurringFollowsDate extends BusinessError {
  constructor() {
    super();
    this.name = "RecurringFollowsDate";
  }
}

export default RecurringFollowsDate;
