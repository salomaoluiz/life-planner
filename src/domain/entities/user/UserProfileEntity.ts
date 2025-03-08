interface IUserProfileEntity {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

class UserProfileEntity {
  id: string;
  name: string;
  email: string;
  photoUrl: string;

  constructor(props: IUserProfileEntity) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoUrl = props.photoUrl;
  }
}

export default UserProfileEntity;
