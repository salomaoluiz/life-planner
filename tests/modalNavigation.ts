// Shared spies behind the global mock of useModalNavigation (see tests/setup.tsx).
export const modalNavigation = {
  closeModal: jest.fn(),
  openModal: jest.fn(),
  replaceModal: jest.fn(),
};
