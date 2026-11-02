import {
  differenceInDays,
  differenceInMilliseconds,
  differenceInYears,
} from "date-fns";

import { Duration } from "./types";

function difference(
  currentDate: Date,
  dateToCompare: Date,
  type: Duration,
): number {
  switch (type) {
    case Duration.days:
      return differenceInDays(currentDate, dateToCompare);
    case Duration.milliseconds:
      return differenceInMilliseconds(currentDate, dateToCompare);
    case Duration.years:
      return differenceInYears(currentDate, dateToCompare);
  }
}

export { difference };
