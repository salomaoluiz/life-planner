import BusinessError from "@domain/entities/errors/common/BusinessError";

// The gesture can no longer be undone: the window passed or a later movement touched its lots (409, spec 117).
class StockUndoTooLate extends BusinessError {
  constructor() {
    super();
    this.name = "StockUndoTooLate";
  }
}

export default StockUndoTooLate;
