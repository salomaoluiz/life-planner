import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

describe("Spacer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Direction prop", () => {
    it("SHOULD render with both direction and size", () => {
      setup({ direction: "both", size: "medium" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer).toBeTruthy();
      expect(spacer.props.style.height).toBeDefined();
      expect(spacer.props.style.width).toBeDefined();
    });

    it("SHOULD render with horizontal direction only", () => {
      setup({ direction: "horizontal", size: "large" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer).toBeTruthy();
      expect(spacer.props.style.width).toBeDefined();
      expect(spacer.props.style.height).toBeUndefined();
    });

    it("SHOULD render with vertical direction only", () => {
      setup({ direction: "vertical", size: "small" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer).toBeTruthy();
      expect(spacer.props.style.height).toBeDefined();
      expect(spacer.props.style.width).toBeUndefined();
    });
  });

  describe("Size prop", () => {
    it("SHOULD render with flex size", () => {
      setup({ direction: "both", size: "flex" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.flex).toBe(1);
    });

    it("SHOULD render with full size", () => {
      setup({ direction: "both", size: "full" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.height).toBe("100%");
      expect(spacer.props.style.width).toBe("100%");
    });

    it("SHOULD render with small spacing size", () => {
      setup({ direction: "both", size: "small" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      // The exact value depends on the theme, but it should be defined
      expect(spacer.props.style.height).toBeDefined();
      expect(spacer.props.style.width).toBeDefined();
    });

    it("SHOULD render with medium spacing size", () => {
      setup({ direction: "both", size: "medium" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.height).toBeDefined();
      expect(spacer.props.style.width).toBeDefined();
    });

    it("SHOULD render with large spacing size", () => {
      setup({ direction: "both", size: "large" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.height).toBeDefined();
      expect(spacer.props.style.width).toBeDefined();
    });
  });

  describe("Horizontal line prop", () => {
    it("SHOULD render without horizontal line by default", () => {
      setup();

      const spacer = screen.getByTestId(defaultProps.testID!);
      // Should only have one child (the main spacer, no line)
      expect(spacer.props.children).toBeNull();
    });

    it("SHOULD render with horizontal line when prop is true", () => {
      setup({ horizontalLine: true });

      const spacer = screen.getByTestId(defaultProps.testID!);
      // Should have a child (the horizontal line)
      expect(spacer.props.children).toBeTruthy();
      expect(spacer.props.children.props.style.borderBottomWidth).toBe(1);
      expect(spacer.props.children.props.style.height).toBe(1);
    });

    it("SHOULD render horizontal line with correct styling", () => {
      setup({ horizontalLine: true });

      const spacer = screen.getByTestId(defaultProps.testID!);
      const line = spacer.props.children;
      
      expect(line.props.style.borderBottomWidth).toBe(1);
      expect(line.props.style.borderColor).toBeDefined();
      expect(line.props.style.height).toBe(1);
      expect(line.props.style.marginHorizontal).toBeDefined();
    });
  });

  describe("Combined props", () => {
    it("SHOULD handle vertical direction with flex size", () => {
      setup({ direction: "vertical", size: "flex" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.flex).toBe(1);
      expect(spacer.props.style.height).toBe("auto");
      expect(spacer.props.style.width).toBeUndefined();
    });

    it("SHOULD handle horizontal direction with full size", () => {
      setup({ direction: "horizontal", size: "full" });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.width).toBe("100%");
      expect(spacer.props.style.height).toBeUndefined();
    });

    it("SHOULD handle both direction with flex and horizontal line", () => {
      setup({ direction: "both", size: "flex", horizontalLine: true });

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style.flex).toBe(1);
      expect(spacer.props.children).toBeTruthy();
    });

    it("SHOULD handle different spacing sizes correctly", () => {
      const sizes = ["small", "medium", "large", "xlarge", "xxlarge"] as const;
      
      sizes.forEach(size => {
        setup({ direction: "both", size });

        const spacer = screen.getByTestId(defaultProps.testID!);
        expect(spacer.props.style.height).toBeDefined();
        expect(spacer.props.style.width).toBeDefined();
        expect(typeof spacer.props.style.height).toBe("number");
        expect(typeof spacer.props.style.width).toBe("number");
      });
    });
  });

  describe("Edge cases", () => {
    it("SHOULD render with testID when provided", () => {
      const testID = "custom-spacer-id";
      setup({ testID });

      const spacer = screen.getByTestId(testID);
      expect(spacer).toBeTruthy();
    });

    it("SHOULD have consistent styling structure", () => {
      setup();

      const spacer = screen.getByTestId(defaultProps.testID!);
      expect(spacer.props.style).toBeDefined();
      expect(typeof spacer.props.style).toBe("object");
    });
  });
});