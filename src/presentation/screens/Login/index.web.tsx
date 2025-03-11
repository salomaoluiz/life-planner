import useLogin from "@screens/Login/hooks/useLogin";
import LoginContainer from "./containers";
import useSaveSession from "@screens/Login/hooks/useSaveSession";

function Login() {
  useSaveSession();
  const { onGoogleButtonPress } = useLogin();

  return <LoginContainer onGoogleButtonPress={onGoogleButtonPress} />;
}

export default Login;
