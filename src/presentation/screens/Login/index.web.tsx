import useLogin from "@screens/Login/hooks/useLogin";
import useSaveSession from "@screens/Login/hooks/useSaveSession";

import LoginContainer from "./containers";

function Login() {
  useSaveSession();
  const { onGoogleButtonPress } = useLogin();

  return <LoginContainer onGoogleButtonPress={onGoogleButtonPress} />;
}

export default Login;
