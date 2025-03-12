interface IUserModel {
  email: string;
  id: string;
  name: string;
  photoURL: string;
}

class UserModel {
  public email: string;
  public id: string;
  public name: string;
  public photoURL: string;

  constructor(props: IUserModel) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoURL = props.photoURL;
  }

  static fromJson(data: Record<string, unknown>): UserModel {
    return new UserModel({
      email: data.email as string,
      id: data.id as string,
      name: data.name as string,
      photoURL: data.photoURL as string,
    });
  }

  toJson(): string {
    return JSON.stringify({
      email: this.email,
      id: this.id,
      name: this.name,
      photoURL: this.photoURL,
    });
  }
}

export default UserModel;
