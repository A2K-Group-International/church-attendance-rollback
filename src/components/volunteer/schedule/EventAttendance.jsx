import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
  const [eventName, setEventName] = useState(""); // State for event name
  const [eventDate, setEventDate] = useState(""); // State for event date
  const [selectedTime, setSelectedTime] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch event name, schedule data, and schedule date together
  const fetchEventData = async () => {
    try {
      const { data, error } = await supabase
        .from("schedule") // Assuming "schedule" is the table containing both event name and schedule
        .select("name, time, schedule_date") // Fetching both event name, schedule times, and schedule date
        .eq("event_uuid", event_uuid);

      if (error) throw error;

      if (data.length > 0) {
        setEventName(data[0].name); // Set the event name
        setEventDate(data[0].schedule_date); // Set the event schedule date
        setScheduleData(data[0].time); // Set the schedule data (time column)
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
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
    fetchEventData(); // Fetch event name, date, and schedule data
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

  // Export to Excel function
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    // Add event name and event date as a header
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value =
      `${eventName} - Attendance (${moment(eventDate).format("YYYY-MM-DD")})`;
    worksheet.getCell("A1").font = { size: 16, bold: true };
    worksheet.getRow(1).height = 30;

    // Add headers (remove "Action" column)
    worksheet.addRow(headers.slice(1)); // Skip the first "Action" header

    // Adjust column widths dynamically and align text
    worksheet.columns = [
      { key: "index", width: 10, alignment: { horizontal: "center" } },
      { key: "attendee_name", width: 30, alignment: { horizontal: "left" } },
      { key: "main_applicant", width: 30, alignment: { horizontal: "left" } },
      { key: "telephone", width: 18, alignment: { horizontal: "center" } },
      { key: "status", width: 12, alignment: { horizontal: "center" } },
    ];

    // Add data rows (remove "Action" data)
    attendanceData
    .filter((item) => item.has_attended) // export only who are attended
    .forEach((item, index) => {
      worksheet.addRow([
        index + 1, // Index
        `${item.attendee_first_name} ${item.attendee_last_name}`, // Name of Attendee
        `${item.main_applicant_first_name} ${item.main_applicant_last_name}`, // Main Applicant
        item.telephone, // Telephone
        "Attended", // Status
      ]);
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate a file name based on event name and date
    const eventDateFormatted = moment(eventDate).format("YYYY-MM-DD");
    const fileName = `${eventName}_${eventDateFormatted}_Attendance.xlsx`;

    // Save as file
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={handleOpenAttendance}>
          <img src={peopleIcon} alt="People Icon" />
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar max-h-[40rem] max-w-7xl overflow-hidden">
        <DialogHeader>
          <div className="flex flex-col gap-x-10 gap-y-2 text-start md:flex-row">
            <DialogTitle>{eventName ? eventName : "Attendance"}</DialogTitle>
            <Select onValueChange={setSelectedTime}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All</SelectItem>
                  {scheduleData.map((timeValue, index) => {
                    const formattedTime = moment(timeValue, "HH:mm").format(
                      "h:mm A",
                    );
                    return (
                      <SelectItem key={index} value={formattedTime}>
                        {formattedTime}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* Export Button */}
            <Button variant="secondary" onClick={exportToExcel}>
              Export to Excel
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Attendance Records
          </DialogDescription>
          <div className="mt-4 text-start">
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
        <div className="no-scrollbar max-h-[25rem] overflow-y-auto">
          <Table headers={headers} rows={filteredRows} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
