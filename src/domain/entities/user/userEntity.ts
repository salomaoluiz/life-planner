interface IUserEntity {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}
class UserEntity {
  id: string;
  name: string;
  email: string;
  photoUrl: string;

  constructor(props: IUserEntity) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.photoUrl = props.photoUrl;
  }
}

export default UserEntity;
