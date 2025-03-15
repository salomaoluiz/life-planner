import * as dateFns from "date-fns";

enum Duration {
  milliseconds = "milliseconds",
}

function add(date: Date | number, timeToAdd: number, type: Duration) {
  switch (type) {
    case Duration.milliseconds:
      return dateFns.addMilliseconds(date, timeToAdd);
  }
}

export { add, Duration };
