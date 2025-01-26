import { isSameDay } from "date-fns";
import { useCalendarContext } from "../../calendar-context";
import CalendarEvent from "../../calendar-event";
import CalendarBodyHeader from "../calendar-body-header";
import { hours } from "./calendar-body-margin-day-margin";

export default function CalendarBodyDayContent({ date }: { date: Date }) {
  const { events, margin_hours } = useCalendarContext();
  console.log(margin_hours);
  const dayEvents = events.filter((event) => isSameDay(event.start, date));
  const [startHour, endHour] = margin_hours || [0, 24];
  // margin hours to show in between hours
  const marginHours = hours.slice(startHour, endHour);

  return (
    <div className="flex flex-col grow">
      <CalendarBodyHeader date={date} />

      <div className="flex-1 relative">
        {marginHours.map((hour) => (
          <div key={hour} className="h-32 border-b border-border/50 group" />
        ))}

        {dayEvents.map((event) => (
          <CalendarEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
