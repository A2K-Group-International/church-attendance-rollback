import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../shadcn/card";
import UserCalendar from "@/components/user/UserCalendar";
import ParishionerQRCodeScanner from "@/components/user/ParishionerQRCodeScanner";

export default function Eventspage() {
  const [eventItems, setEventItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organiser, setOrganiser] = useState([]);
  const navigate = useNavigate();

  const formatTime = (timeStr) => {
    if (!timeStr) return "Invalid time";
    const [time, timezone] = timeStr.split("+");
    const [hours, minutes] = time.split(":");
    const hours24 = parseInt(hours, 10);
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("schedule")
          .select("*")
          .order("id", { ascending: false });

        if (error) throw error;

        const formattedEvents = data.map((event) => {
          const eventTimes = event.time; // array of available times

          return {
            id: event.id,
            title: event.name,
            content: event.description,
            date: event.schedule_date,
            times: eventTimes ? eventTimes.map(formatTime) : [],
            creator_name: event.creator_name,
          };
        });

        setEventItems(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    navigate(`/event-info/${event.id}`);
  };

  if (loading) {
    return (
      <main className="p-4 lg:p-8">
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Latest upcoming events at the church.
        </p>
      </div>
      <div className="mt-2 flex">
        <UserCalendar />
        <ParishionerQRCodeScanner />
      </div>

      <div className="no-scrollbar grid mt-2 pb-44 grid-cols-1 gap-4 overflow-scroll md:grid-cols-2 lg:grid-cols-3">
        {eventItems.map((item) => (
          <Card
            key={item.id}
            className="p-4 shadow-lg"
            onClick={() => handleEventClick(item)}
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="flex flex-col">
                {console.log(item.creator_name)}
                <p>Organiser: {item.creator_name}</p>
                <p>{item.content}</p>

                <div className="mt-4">
                  <strong className="text-lg">Date:</strong>
                  <p className="text-gray-700 dark:text-gray-300">
                    {item.date}
                  </p>
                </div>

                <div className="mt-2">
                  <strong className="text-lg">
                    Time{item.times.length > 1 ? "s" : ""}:
                  </strong>
                  {item.times.length > 0 ? (
                    item.times.length === 1 ? (
                      <p className="text-gray-700 dark:text-gray-300">
                        {item.times[0]}
                      </p>
                    ) : (
                      <ul className="text-gray-700 dark:text-gray-300">
                        {" "}
                        {/* Correct <ul> usage */}
                        {item.times.map((time, index) => (
                          <li key={index}>{time}</li>
                        ))}
                      </ul>
                    )
                  ) : (
                    <p>Time not available</p>
                  )}
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
