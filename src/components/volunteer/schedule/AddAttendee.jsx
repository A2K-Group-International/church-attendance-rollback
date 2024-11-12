import { useState, useEffect } from "react";
import { Button } from "../../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import { Input } from "../../../shadcn/input";
import { Label } from "../../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import supabase from "@/api/supabase";

const schema = z.object({
  main_applicant_first_name: z.string().min(1, "First name is required"),
  main_applicant_last_name: z.string().min(1, "Last name is required"),
  telephone: z.string().min(1, "Telephone is required"),
});

export default function AddAttendee({ event_uuid }) {
  const [attendees, setAttendees] = useState([]); // Store attendee details
  const [eventList, setEventList] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState(""); // State to hold error messages

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const attendanceSubmit = async (data) => {
    try {
      // Check if `attendees` is empty, and if so, create a default entry with the main applicant's info
      const attendeesData = (
        attendees.length > 0
          ? attendees
          : [
              {
                firstName: data.main_applicant_first_name,
                lastName: data.main_applicant_last_name,
              },
            ]
      ).map((attendee) => ({
        attendee_first_name: attendee.firstName,
        attendee_last_name: attendee.lastName,
        main_applicant_first_name: data.main_applicant_first_name,
        main_applicant_last_name: data.main_applicant_last_name,
        telephone: data.telephone,
        selected_event: eventList[0]?.name,
        selected_time: selectedTime,
        selected_event_id: eventList[0]?.event_uuid,
        selected_event_date: eventList[0]?.schedule_date,
        attendance_type: "family",
        has_attended: true,
      }));

      // Insert attendees data into Supabase
      const { error } = await supabase
        .from("new_attendance")
        .insert(attendeesData);

      if (error) {
        throw error;
      }

      // Reset form and attendees
      reset();
      setAttendees([]); // Reset attendees
      alert("Attendees added successfully!");
    } catch (error) {
      console.log("Error inserting attendee:", error);
    }
  };

  const handleAddAttendee = () => {
    setAttendees([...attendees, { firstName: "", lastName: "" }]);
  };

  const handleRemoveAttendee = (index) => {
    const updatedAttendees = attendees.filter((_, i) => i !== index);
    setAttendees(updatedAttendees);
  };

  const handleAttendeeInputChange = (index, field, value) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index][field] = value;
    setAttendees(updatedAttendees);
  };

  const closeModal = () => {
    reset();
  };

  const handleTimeChange = (value) => {
    setSelectedTime(value);
    setError(""); // Clear error when the time is selected
  };

  // Function to format time to 9:00 AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split("+")[0].split(":");
    const hours12 = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours < 12 ? "AM" : "PM"; // Determine AM/PM
    return `${hours12}:${minutes.padStart(2, "0")} ${ampm}`; // Return formatted time
  };

  // Fetch all events on component mount
  useEffect(() => {
    const fetchedEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("schedule")
          .select("*")
          .eq("event_uuid", event_uuid);

        if (error) throw error;

        setEventList(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to load schedule", error);
      }
    };

    fetchedEvents();
  }, [event_uuid]);

  return (
    <Dialog onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <Button>Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Registration</DialogTitle>
          <DialogDescription>Add new attendee</DialogDescription>
        </DialogHeader>
        {/* Form*/}
        <form
          onSubmit={handleSubmit(attendanceSubmit)}
          className="no-scrollbar max-h-[30rem] overflow-scroll"
        >
          <div>
            <Select value={selectedTime} onValueChange={handleTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {eventList.map((item) =>
                  item.time.map((time, index) => (
                    <SelectItem key={index} value={time}>
                      {formatTime(time)}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-4 p-2">
            <Label>Main Applicant</Label>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                {...register("main_applicant_first_name")}
                placeholder="First name"
                className="w-full md:w-1/3"
              />
              <Input
                {...register("main_applicant_last_name")}
                placeholder="Last name"
                className="w-full md:w-1/3"
              />
              <Input
                {...register("telephone")}
                placeholder="Telephone"
                className="w-full md:w-1/3"
              />
            </div>

            <Label>Attendee Information</Label>
            {attendees.map((attendee, index) => (
              <div key={index} className="flex flex-col gap-2 md:flex-row">
                <Input
                  value={attendee.firstName}
                  onChange={(e) =>
                    handleAttendeeInputChange(
                      index,
                      "firstName",
                      e.target.value,
                    )
                  }
                  placeholder="First name"
                />
                <Input
                  value={attendee.lastName}
                  onChange={(e) =>
                    handleAttendeeInputChange(index, "lastName", e.target.value)
                  }
                  placeholder="Last name"
                />

                <Button
                  type="button"
                  onClick={() => handleRemoveAttendee(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div>
              <Button
                type="button"
                onClick={handleAddAttendee}
                className="mt-2"
              >
                Add
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
