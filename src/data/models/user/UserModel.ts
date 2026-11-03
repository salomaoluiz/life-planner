export interface UserFamilyModel {
  id: string;
  name: string;
  status: string;
}

interface IUserModel {
  avatarURL?: string;
  email: string;
  families?: UserFamilyModel[];
  id: string;
  name: string;
}

class UserModel {
  public avatarURL?: string;
  public email: string;
  // Families of `/user/me` (spec 074). Not part of the cached profile json: they change on their own.
  public families: UserFamilyModel[];
  public id: string;
  public name: string;

  constructor(props: IUserModel) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.avatarURL = props.avatarURL;
    this.families = props.families ?? [];
  }

  static fromJSON(data: Record<string, unknown>): UserModel {
    return new UserModel({
      avatarURL:
        typeof data.photoUrl === "string" && data.photoUrl
          ? data.photoUrl
          : undefined,
      email: data.email as string,
      families: Array.isArray(data.families)
        ? (data.families as UserFamilyModel[]).map((family) => ({
            id: family.id,
            name: family.name,
            status: family.status,
          }))
        : [],
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
