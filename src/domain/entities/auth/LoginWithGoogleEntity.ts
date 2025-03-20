interface ILoginWithGoogleEntity {
  avatarURL: string;
  email: string;
  id: string;
  name: string;
}

class LoginWithGoogleEntity {
  avatarURL: string;
  email: string;
  id: string;
  name: string;

  constructor(props: ILoginWithGoogleEntity) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.avatarURL = props.avatarURL;
  }
}

export default LoginWithGoogleEntity;
