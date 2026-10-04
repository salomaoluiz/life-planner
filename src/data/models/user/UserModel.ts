interface IUserModel {
  avatarURL?: string;
  email: string;
  id: string;
  name: string;
}

class UserModel {
  public avatarURL?: string;
  public email: string;
  public id: string;
  public name: string;

  constructor(props: IUserModel) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.avatarURL = props.avatarURL;
  }

  static fromJSON(data: Record<string, unknown>): UserModel {
    return new UserModel({
      avatarURL:
        typeof data.photoUrl === "string" && data.photoUrl
          ? data.photoUrl
          : undefined,
      email: data.email as string,
      id: data.id as string,
      name: data.name as string,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      email: this.email,
      id: this.id,
      name: this.name,
      photoUrl: this.avatarURL,
    };
  }
}

export default UserModel;
