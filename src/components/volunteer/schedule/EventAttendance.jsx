import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import { Button } from "../../../shadcn/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import peopleIcon from "../../../assets/svg/people.svg";
import supabase from "@/api/supabase";
import { useState, useEffect, useCallback } from "react";
import Table from "../../../components/Table";
import { Switch } from "../../../shadcn/switch";
import moment from "moment";
import AddAttendee from "./AddAttendee";

const headers = [
  "Action",
  "#",
  "Name of Attendees",
  "Main Applicant",
  "Telephone",
  "Status",
];

export default function EventAttendance({ event_uuid }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEventTime = async () => {
    try {
      const { data, error } = await supabase
        .from("schedule")
        .select("time")
        .eq("event_uuid", event_uuid);

      if (error) throw new error();
      setScheduleData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchedEventAttendance = useCallback(async () => {
    try {
      let query = supabase
        .from("new_attendance")
        .select("*")
        .eq("selected_event_id", event_uuid);

      if (selectedTime && selectedTime !== "All") {
        query = query.eq("selected_time", selectedTime);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  }, [event_uuid, selectedTime]);

  useEffect(() => {
    if (selectedTime !== null) {
      fetchedEventAttendance();
    }
  }, [selectedTime, fetchedEventAttendance]);

  const handleOpenAttendance = () => {
    fetchEventTime();
    fetchedEventAttendance();
  };

  const handleSwitchChange = async (itemId, checked) => {
    try {
      const { error } = await supabase
        .from("new_attendance")
        .update({ has_attended: checked })
        .eq("id", itemId);

      if (error) throw error;

      const updatedData = attendanceData.map((dataItem) =>
        dataItem.id === itemId
          ? { ...dataItem, has_attended: checked }
          : dataItem,
      );
      setAttendanceData(updatedData);
    } catch (error) {
      console.error("Error in handleSwitchChange function:", error);
    }
  };

  const filteredRows = attendanceData
    .filter((item) =>
      item.attendee_first_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => [
      <Switch
        key={item.id}
        checked={item.has_attended}
        onCheckedChange={(checked) => handleSwitchChange(item.id, checked)}
        aria-label="Toggle attendance status"
      />,
      index + 1,
      `${item.attendee_first_name} ${item.attendee_last_name}`,
      `${item.main_applicant_first_name} ${item.main_applicant_last_name}`,
      <a
        key={item.id}
        href={`tel: ${item.telephone}`}
        className="text-blue-500"
      >
        {item.telephone}
      </a>,
      item.has_attended ? "Attended" : "Pending",
    ]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={handleOpenAttendance}>
          <img src={peopleIcon} alt="People Icon" />
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar max-h-[40rem] max-w-7xl overflow-hidden">
        <DialogHeader>
          <div className="flex gap-x-10">
            <DialogTitle>Attendance</DialogTitle>
            <Select onValueChange={setSelectedTime}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All</SelectItem>
                  {scheduleData.map((item, index) =>
                    item.time.map((timeValue, timeIndex) => {
                      const formattedTime = moment(timeValue, "HH:mm").format(
                        "h:mm A",
                      );
                      return (
                        <SelectItem
                          key={`${index}-${timeIndex}`}
                          value={formattedTime}
                        >
                          {formattedTime}
                        </SelectItem>
                      );
                    }),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogDescription className="sr-only">
            Attendance Records
          </DialogDescription>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded border p-2"
            />
            <AddAttendee event_uuid={event_uuid} />
          </div>
        </DialogHeader>
        <div className="max-h-[30rem] overflow-y-auto">
          <Table headers={headers} rows={filteredRows} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
