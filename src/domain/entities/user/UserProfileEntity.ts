interface IUserProfileEntity {
  email: string;
  id: string;
  name: string;
  photoUrl: string;
}

class UserProfileEntity {
  email: string;
  id: string;
  name: string;
  photoUrl: string;

  constructor(props: IUserProfileEntity) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoUrl = props.photoUrl;
  }
}

export default UserProfileEntity;
