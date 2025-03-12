import LoginContainer from "@screens/Login/containers";
import useLogin from "@screens/Login/hooks/useLogin";

function Login() {
  const { onGoogleButtonPress } = useLogin();

  return <LoginContainer onGoogleButtonPress={onGoogleButtonPress} />;
}

export default Login;
