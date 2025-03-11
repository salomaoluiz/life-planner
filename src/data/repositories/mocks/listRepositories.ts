import Repositories from "@domain/repositories";

const repositoriesMocks = {
  loginRepository: {
    logout: jest.fn(),
    loginWithGoogle: jest.fn(),
    saveSession: jest.fn(),
  },
  userRepository: {
    getUser: jest.fn(),
  },
} as Repositories;

export { repositoriesMocks };
