import { addDays, addMilliseconds, addYears } from "date-fns";

import { Duration } from "./types";

function add(date: Date | number, timeToAdd: number, type: Duration) {
  switch (type) {
    case Duration.days:
      return addDays(date, timeToAdd);
    case Duration.milliseconds:
      return addMilliseconds(date, timeToAdd);
    case Duration.years:
      return addYears(date, timeToAdd);
  }
}

export { add };
