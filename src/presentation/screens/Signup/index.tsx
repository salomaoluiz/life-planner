import { Href, Redirect } from "expo-router";

import { AdaptiveLayout } from "@components";

import useSignupViewModel from "./hooks/useSignupViewModel";
import { Wide } from "./views";

function Signup() {
  const vm = useSignupViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Signup;
