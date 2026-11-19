import BusinessError from "@domain/entities/errors/common/BusinessError";

// SPLIT_ROW_USE_SPLIT: a part changes only through its split (422) (spec 119).
class SplitRowUseSplit extends BusinessError {
  constructor() {
    super();
    this.name = "SplitRowUseSplit";
  }
}

export default SplitRowUseSplit;
