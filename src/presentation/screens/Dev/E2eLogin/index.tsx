import useE2eLoginViewModel from "./hooks/useE2eLoginViewModel";

// Dev-only, blank screen: stores the E2E session from the URL fragment and moves on (spec 036).
function E2eLogin() {
  useE2eLoginViewModel();
  return null;
}

export default E2eLogin;
