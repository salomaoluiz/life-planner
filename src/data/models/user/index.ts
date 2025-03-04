interface IUserModel {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

class UserModel {
  public id: string;
  public name: string;
  public email: string;
  public photoURL: string;

  constructor(props: IUserModel) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoURL = props.photoURL;
  }

  static fromJson(data: Record<string, unknown>): UserModel {
    return new UserModel({
      id: data.id as string,
      name: data.name as string,
      email: data.email as string,
      photoURL: data.photoURL as string,
    });
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      email: this.email,
      photoURL: this.photoURL,
    });
  }
}

export default UserModel;
