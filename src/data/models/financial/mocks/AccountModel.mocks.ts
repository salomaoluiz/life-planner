import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import AccountModel from "../AccountModel";

// API / cache shape: camelCase, balance in cents.
const jsonMock = {
  balance: 152075,
  icon: "bank-icon",
  id: "2be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  name: "Savings Account",
  owner: "USER",
  ownerId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  status: "ACTIVE",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new AccountModel({
    balance: 1520.75,
    icon: jsonMock.icon,
    id: jsonMock.id,
    name: jsonMock.name,
    owner: jsonMock.owner as OwnerType,
    ownerId: jsonMock.ownerId,
    status: jsonMock.status as AccountStatus,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
