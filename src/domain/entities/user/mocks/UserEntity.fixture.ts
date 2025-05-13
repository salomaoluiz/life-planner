import UserProfileEntity from "@domain/entities/user/UserProfileEntity";

class UserEntityFixture {
  value = {} as UserProfileEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as UserProfileEntity;
    return this;
  }

  withDefault() {
    this.value = {
      email: "teste@gmail.com",
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      name: "User Name",
      photoUrl: "https://example.com/photo.jpg",
    };
    return this;
  }

  withEmail(email: string) {
    this.value.email = email;
    return this;
  }

  withId(id: string) {
    this.value.id = id;
    return this;
  }

  withName(name: string) {
    this.value.name = name;
    return this;
  }

  withPhotoUrl(photoUrl: string) {
    this.value.photoUrl = photoUrl;
    return this;
  }
}

export default UserEntityFixture;
