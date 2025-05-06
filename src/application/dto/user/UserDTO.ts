import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

export interface IUserDTO {
  email: string;
  id: string;
  name: string;
  photoUrl: string;
}

class UserDTO {
  static USER_ID_MISSING = "USER_ID_MISSING" as const;

  email: string;
  id: string;
  name: string;

  photoUrl: string;

  constructor(props: IUserDTO) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoUrl = props.photoUrl;
  }

  static fromEntity(userEntity: UserProfileEntity) {
    return new UserDTO({
      email: userEntity.email,
      id: userEntity.id,
      name: userEntity.name,
      photoUrl: userEntity.photoUrl,
    });
  }
}

export default UserDTO;
