interface IUserModel {
  avatarURL: string;
  email: string;
  id: string;
  name: string;
}

class UserModel {
  public avatarURL: string;
  public email: string;
  public id: string;
  public name: string;

  constructor(props: IUserModel) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.avatarURL = props.avatarURL;
  }

  static fromJson(data: Record<string, unknown>): UserModel {
    return new UserModel({
      avatarURL: data.avatar_url as string,
      email: data.email as string,
      id: data.id as string,
      name: data.name as string,
    });
  }

  toJson(): Record<string, unknown> {
    return {
      avatar_url: this.avatarURL,
      email: this.email,
      id: this.id,
      name: this.name,
    };
  }
}

export default UserModel;
