import { api } from "@infrastructure/api";

import inviteFamilyMember from "../inviteFamilyMember";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const token = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
const email = "test@example.com";

async function setup(
  arg: Parameters<typeof inviteFamilyMember>[0] = {
    email,
    familyId: "family-1",
  },
) {
  return inviteFamilyMember(arg);
}

async function setupThrowable(arg?: Parameters<typeof inviteFamilyMember>[0]) {
  try {
    await setup(arg);
  } catch (error) {
    return error;
  }
}

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  post: jest.mocked(api.post),
};
const mocks = { email, token };

export { mocks, setup, setupThrowable, spies };
