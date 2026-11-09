import { Href, Redirect } from "expo-router";

import { AdaptiveLayout } from "@components";

import useLoginViewModel from "./hooks/useLoginViewModel";
import { Wide } from "./views";

function Login() {
  const vm = useLoginViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Login;
