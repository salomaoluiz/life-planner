import BusinessError from "@domain/entities/errors/common/BusinessError";

// The version endpoint could not be reached: the app keeps working and shows "API unavailable".
class VersionUnavailable extends BusinessError {
  constructor() {
    super();
    this.name = "VersionUnavailable";
  }
}

export default VersionUnavailable;
