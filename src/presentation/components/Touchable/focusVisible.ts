interface FocusLikeEvent {
  nativeEvent?: { target?: unknown };
  target?: unknown;
}

// react-native-web fires onFocus for mouse clicks too. :focus-visible is true only for
// keyboard-initiated focus (and for text inputs), which is when the ring is wanted.
export function isKeyboardFocus(event: FocusLikeEvent): boolean {
  const target = (event.target ?? event.nativeEvent?.target) as
    | undefined
    | { matches?: (selector: string) => boolean };

  if (!target || typeof target.matches !== "function") {
    return true;
  }
  try {
    return target.matches(":focus-visible");
  } catch {
    return true;
  }
}
