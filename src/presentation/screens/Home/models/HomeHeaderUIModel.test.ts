import UserDTO from "@application/dto/user/UserDTO";

import HomeHeaderUIModel from "./HomeHeaderUIModel";

const user = new UserDTO({
  email: "test@example.com",
  id: "user-id",
  name: "Ana Maria Souza",
});

function at(hour: number, who: null | UserDTO = user) {
  return new HomeHeaderUIModel(
    who ?? undefined,
    new Date(2026, 9, 3, hour, 0),
    "en-US",
  );
}

it.each([
  [4, "evening"],
  [5, "morning"],
  [11, "morning"],
  [12, "afternoon"],
  [17, "afternoon"],
  [18, "evening"],
  [23, "evening"],
])("SHOULD greet at hour %s with %s", (hour, period) => {
  expect(at(hour).greetingKey).toBe(`home.greeting.${period}`);
});

it("SHOULD pass the first name only", () => {
  expect(at(9).greetingParams).toEqual({ name: "Ana" });
});

it("SHOULD drop the name WHEN the user has none (or is not loaded)", () => {
  const nameless = new UserDTO({
    email: "test@example.com",
    id: "user-id",
    name: "  ",
  });

  expect(at(9, nameless).greetingKey).toBe("home.greeting.morningNoName");
  expect(at(9, nameless).greetingParams).toBeUndefined();
  expect(at(9, null).greetingKey).toBe("home.greeting.morningNoName");
});

it("SHOULD use the name, then the email, then a question mark for the avatar", () => {
  const nameless = new UserDTO({
    email: "test@example.com",
    id: "user-id",
    name: "",
  });

  expect(at(9).avatarName).toBe("Ana Maria Souza");
  expect(at(9, nameless).avatarName).toBe("test@example.com");
  expect(at(9, null).avatarName).toBe("?");
});

it("SHOULD pass the photo url through", () => {
  const withPhoto = new UserDTO({
    email: "test@example.com",
    id: "user-id",
    name: "Ana",
    photoUrl: "https://example.com/p.png",
  });

  expect(at(9, withPhoto).avatarPhotoUrl).toBe("https://example.com/p.png");
  expect(at(9, null).avatarPhotoUrl).toBeUndefined();
});

it("SHOULD format the long date in the active locale", () => {
  const date = new Date(2026, 9, 3, 9, 0);

  expect(new HomeHeaderUIModel(user, date, "en-US").overline).toBe(
    "Saturday, October 3",
  );
  expect(new HomeHeaderUIModel(user, date, "pt-BR").overline).toBe(
    "sábado, 3 de outubro",
  );
});
