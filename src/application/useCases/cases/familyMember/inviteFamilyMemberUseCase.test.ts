import { DefaultError, GenericError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  spies,
  throwableSetup,
} from "./mocks/inviteFamilyMemberUseCase.mocks";

it("SHOULD invite through the repository AND return the token and expiry from the API", async () => {
  spies.inviteFamilyMember.mockResolvedValueOnce(mocks.inviteResponse);

  const response = await setup();

  expect(spies.inviteFamilyMember).toHaveBeenCalledTimes(1);
  expect(spies.inviteFamilyMember).toHaveBeenCalledWith({
    email: "test@example.com",
    familyId: "123",
  });
  expect(response).toEqual(mocks.inviteResponse);
});

it("SHOULD trim the email before sending", async () => {
  spies.inviteFamilyMember.mockResolvedValueOnce(mocks.inviteResponse);

  await setup("  test@example.com ");

  expect(spies.inviteFamilyMember).toHaveBeenCalledWith({
    email: "test@example.com",
    familyId: "123",
  });
});

it("SHOULD throw an unknown error if anything throws", async () => {
  const errorMock = new Error("Repository failed");
  spies.inviteFamilyMember.mockRejectedValueOnce(errorMock);

  const error = await throwableSetup();

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe(errorMock.message);
});

it("SHOULD add the use case to the context of a DefaultError", async () => {
  spies.inviteFamilyMember.mockRejectedValueOnce(new GenericError());

  const error = await throwableSetup();

  const expectedError = new GenericError();
  expectedError.addContext({ useCase: "inviteFamilyMemberUseCase" });
  expect(error).toBeInstanceOf(GenericError);
  expect((error as DefaultError).context).toEqual(expectedError.context);
});
