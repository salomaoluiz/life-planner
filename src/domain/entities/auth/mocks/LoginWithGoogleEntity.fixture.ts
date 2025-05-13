import LoginWithGoogleEntity from "@domain/entities/auth/LoginWithGoogleEntity";

class LoginWithGoogleEntityFixture {
  value = {} as LoginWithGoogleEntity;

  build() {
    return { ...this.value };
  }

  reset() {
    this.value = {} as LoginWithGoogleEntity;
  }

  withAvatarURL(avatarURL: string) {
    this.value.avatarURL = avatarURL;
    return this;
  }

  withDefault() {
    this.value = {
      avatarURL: "https://example.com/avatar.jpg",
      email: "teste@gmail.com",
      id: "c6d76166-e7f3-4823-bd5b-f8bbd33912ac",
      name: "John Doe",
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
}

export default LoginWithGoogleEntityFixture;
