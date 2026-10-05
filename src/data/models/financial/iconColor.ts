// The API stores #RRGGBB (default #000000); the app uses the "black" token plus hex values.
const API_BLACK = "#000000";
const APP_BLACK = "black";

function fromApiColor(color: unknown): string {
  if (typeof color !== "string") {
    return APP_BLACK;
  }

  return color.toLowerCase() === API_BLACK ? APP_BLACK : color;
}

function toApiColor(color: string): string {
  return color === APP_BLACK ? API_BLACK : color;
}

export { fromApiColor, toApiColor };
