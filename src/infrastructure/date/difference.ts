import * as dateFns from "date-fns";

import { Duration } from "./types";

function difference(
  currentDate: Date,
  dateToCompare: Date,
  type: Duration,
): number {
  switch (type) {
    case Duration.days:
      return dateFns.differenceInDays(currentDate, dateToCompare);
    case Duration.milliseconds:
      return dateFns.differenceInMilliseconds(currentDate, dateToCompare);
    case Duration.years:
      return dateFns.differenceInYears(currentDate, dateToCompare);
  }
}

export { difference };
