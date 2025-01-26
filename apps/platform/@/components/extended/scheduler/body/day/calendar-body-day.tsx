import { useCalendarContext } from "../../calendar-context";
import CalendarBodyDayCalendar from "./calendar-body-day-calendar";
import CalendarBodyDayContent from "./calendar-body-day-content";
import CalendarBodyDayEvents from "./calendar-body-day-events";
import CalendarBodyMarginDayMargin from "./calendar-body-margin-day-margin";

export default function CalendarBodyDay() {
  const { date } = useCalendarContext();
  return (
    <div className="flex divide-x grow overflow-hidden">
      <div className="flex flex-col grow divide-y overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="relative flex flex-1 divide-x">
            <CalendarBodyMarginDayMargin />
            <CalendarBodyDayContent date={date} />
          </div>
        </div>
      </div>
      <div className="lg:flex hidden flex-col grow divide-y max-w-[276px]">
        <CalendarBodyDayCalendar />
        <CalendarBodyDayEvents />
      </div>
    </div>
  );
}
