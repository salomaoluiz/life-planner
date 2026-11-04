import { addDays } from "date-fns/addDays";
import { addMilliseconds } from "date-fns/addMilliseconds";
import { addYears } from "date-fns/addYears";

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
