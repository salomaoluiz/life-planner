import Repositories from "@domain/repositories";

const repositoriesMocks = {
  loginRepository: {
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  userRepository: {
    getUser: jest.fn(),
  },
} as Repositories;

export { repositoriesMocks };
