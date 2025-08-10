import { act, fireEvent, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

describe("Accordion Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Container", () => {
    it("SHOULD render Accordion with correct props", () => {
      setup.container();

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion).toBeTruthy();
    });

    it("SHOULD render with header content", () => {
      setup.container();

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion).toBeTruthy();
      
      // The header content should be rendered within the component
      expect(screen.getByText("Test Header")).toBeTruthy();
    });

    it("SHOULD initially be collapsed", () => {
      const mockGetAccordionStatus = jest.fn();
      setup.container({ getAccordionStatus: mockGetAccordionStatus });

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion.props.expanded).toBe(false);
      
      // Should call getAccordionStatus with false initially
      expect(mockGetAccordionStatus).toHaveBeenCalledWith(false);
    });

    it("SHOULD expand when pressed", () => {
      const mockGetAccordionStatus = jest.fn();
      const mockOnPress = jest.fn();
      setup.container({ 
        getAccordionStatus: mockGetAccordionStatus,
        onPress: mockOnPress 
      });

      const accordion = screen.getByTestId("accordion-container");

      // Initially collapsed
      expect(accordion.props.expanded).toBe(false);

      // Press to expand
      fireEvent.press(accordion);

      // Should now be expanded
      expect(accordion.props.expanded).toBe(true);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockGetAccordionStatus).toHaveBeenCalledWith(true);
    });

    it("SHOULD toggle expanded state on multiple presses", () => {
      setup.container();

      const accordion = screen.getByTestId("accordion-container");

      // Initially collapsed
      expect(accordion.props.expanded).toBe(false);

      // First press - expand
      fireEvent.press(accordion);
      expect(accordion.props.expanded).toBe(true);

      // Second press - collapse
      fireEvent.press(accordion);
      expect(accordion.props.expanded).toBe(false);

      // Third press - expand again
      fireEvent.press(accordion);
      expect(accordion.props.expanded).toBe(true);
    });

    it("SHOULD call onPress when provided", () => {
      const mockOnPress = jest.fn();
      setup.container({ onPress: mockOnPress });

      const accordion = screen.getByTestId("accordion-container");
      fireEvent.press(accordion);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("SHOULD call onLongPress when provided", () => {
      const mockOnLongPress = jest.fn();
      setup.container({ onLongPress: mockOnLongPress });

      const accordion = screen.getByTestId("accordion-container");
      fireEvent(accordion, "onLongPress");

      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    });

    it("SHOULD render with left element when provided", () => {
      setup.container({ hasLeft: true });

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion).toBeTruthy();
      
      // The left element should be rendered
      expect(screen.getByText("Left Content")).toBeTruthy();
    });

    it("SHOULD render with right element when provided", () => {
      setup.container({ hasRight: true });

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion).toBeTruthy();
      
      // The right element should be rendered
      expect(screen.getByText("Right Content")).toBeTruthy();
    });

    it("SHOULD render content when expanded", () => {
      setup.container();

      const accordion = screen.getByTestId("accordion-container");
      
      // Expand the accordion
      fireEvent.press(accordion);
      
      // Content should now be visible
      expect(screen.getByText("Test Content")).toBeTruthy();
    });

    it("SHOULD call getAccordionStatus when expanded state changes", () => {
      const mockGetAccordionStatus = jest.fn();
      setup.container({ getAccordionStatus: mockGetAccordionStatus });

      const accordion = screen.getByTestId("accordion-container");

      // Clear initial call
      mockGetAccordionStatus.mockClear();

      // Expand
      fireEvent.press(accordion);
      expect(mockGetAccordionStatus).toHaveBeenCalledWith(true);

      // Collapse
      fireEvent.press(accordion);
      expect(mockGetAccordionStatus).toHaveBeenCalledWith(false);
    });

    it("SHOULD not call getAccordionStatus when not provided", () => {
      setup.container({ getAccordionStatus: undefined });

      const accordion = screen.getByTestId("accordion-container");

      // Should not throw when getAccordionStatus is not provided
      expect(() => {
        fireEvent.press(accordion);
      }).not.toThrow();
    });

    it("SHOULD pass correct id when provided", () => {
      const testId = "test-accordion-id";
      setup.container({ id: testId });

      const accordion = screen.getByTestId("accordion-container");
      expect(accordion.props.id).toBe(testId);
    });
  });

  describe("Item", () => {
    it("SHOULD render Item with correct props", () => {
      setup.item();

      const item = screen.getByTestId("accordion-item");
      expect(item).toBeTruthy();
    });

    it("SHOULD render with title", () => {
      setup.item();

      // The title should be rendered
      expect(screen.getByText("Test Item")).toBeTruthy();
    });

    it("SHOULD call onPress when pressed", () => {
      const mockOnPress = jest.fn();
      setup.item({ onPress: mockOnPress });

      const item = screen.getByTestId("accordion-item");
      fireEvent.press(item);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("SHOULD be disabled when onPress is not provided", () => {
      setup.item({ onPress: undefined });

      const item = screen.getByTestId("accordion-item");
      expect(item.props.disabled).toBe(true);
    });

    it("SHOULD be enabled when onPress is provided", () => {
      const mockOnPress = jest.fn();
      setup.item({ onPress: mockOnPress });

      const item = screen.getByTestId("accordion-item");
      expect(item.props.disabled).toBe(false);
    });

    it("SHOULD render with left element when provided", () => {
      setup.item({ hasLeft: true });

      const item = screen.getByTestId("accordion-item");
      expect(item).toBeTruthy();
      
      // The left element should be rendered
      expect(screen.getByText("Left Item")).toBeTruthy();
    });

    it("SHOULD render with right element when provided", () => {
      setup.item({ hasRight: true });

      const item = screen.getByTestId("accordion-item");
      expect(item).toBeTruthy();
      
      // The right element should be rendered
      expect(screen.getByText("Right Item")).toBeTruthy();
    });

    it("SHOULD pass correct id", () => {
      const testId = "test-item-id";
      setup.item({ id: testId });

      const item = screen.getByTestId("accordion-item");
      expect(item.props.id).toBe(testId);
    });
  });
});