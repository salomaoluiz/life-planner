import useE2eCsvViewModel from "./hooks/useE2eCsvViewModel";

// Dev-only, blank screen: leaves a CSV for the import wizard's next file pick and moves on (spec 047).
function E2eCsv() {
  useE2eCsvViewModel();

  return null;
}

export default E2eCsv;
