import * as dateFns from "date-fns";

import { Duration } from "./types";

function add(date: Date | number, timeToAdd: number, type: Duration) {
  switch (type) {
    case Duration.days:
      return dateFns.addDays(date, timeToAdd);
    case Duration.milliseconds:
      return dateFns.addMilliseconds(date, timeToAdd);
    case Duration.years:
      return dateFns.addYears(date, timeToAdd);
  }
}

export { add };
