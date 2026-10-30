import { Pressable } from "react-native";

import { act, fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";
import { isWeb } from "@utils/platform";

import NoteIcon from "./index";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

const NOTE = "Casa → Aeroporto de Guarulhos, terminal 2. Corrida às 5h40";

it("SHOULD show the icon with its accessibility label, and no bubble on native", () => {
  jest.mocked(isWeb).mockReturnValue(false);
  render(<NoteIcon note={NOTE} />);

  expect(screen.getByTestId(transactionsTestIds.rowNoteIcon)).toBeOnTheScreen();
  expect(
    screen.getByLabelText("financial.transactions.hasNote"),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(transactionsTestIds.rowNoteTooltip)).toBeNull();
});

it("SHOULD show the note in at most 2 lines on hover and on keyboard focus (web)", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  render(<NoteIcon note={NOTE} />);

  const anchor = screen.UNSAFE_getByType(Pressable);

  fireEvent(anchor, "hoverIn");
  expect(
    screen.getByTestId(transactionsTestIds.rowNoteTooltip),
  ).toBeOnTheScreen();
  expect(screen.getByText(NOTE).props.numberOfLines).toBe(2);

  fireEvent(anchor, "hoverOut");
  expect(screen.queryByTestId(transactionsTestIds.rowNoteTooltip)).toBeNull();

  // RN's Pressable does not forward onFocus to the host view under jest (react-native-web does).
  act(() => anchor.props.onFocus());
  expect(
    screen.getByTestId(transactionsTestIds.rowNoteTooltip),
  ).toBeOnTheScreen();
  act(() => anchor.props.onBlur());
  expect(screen.queryByTestId(transactionsTestIds.rowNoteTooltip)).toBeNull();
});
