import { useState, useEffect } from "react";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { userAttendance, fetchAllEvents } from "@/api/userService";
import moment from "moment";
import supabase from "@/api/supabase";
import { useToast } from "@/shadcn/use-toast";
import clsx from "clsx";

const attendanceCodeSchema = z.object({
  attendanceCode: z
    .string()
    .length(6, "Attendance code must be exactly 6 digits.")
    .regex(/^\d{6}$/, "Attendance code must be a number."),
});
const attendeeSchema = z.object({
  attendeeid: z.any().optional(),
firstName: z
    .string()
    .min(1, "First Name is required")
    .max(100, "First Name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last Name is required")
    .max(100, "Last Name must be less than 100 characters"),
});

const mainApplicantSchema = z.object({
  main_applicant_first_name: z
    .string()
    .min(1, "First Name is required")
    .max(100, "First Name must be less than 100 characters"),
  main_applicant_last_name: z
    .string()
    .min(1, "Last Name is required")
    .max(100, "Last Name must be less than 100 characters"),
  telephone: z
    .string()
    .min(1, "Telephone is required")
    .regex(/^[0-9]{11}$/, "Telephone must be an 11-digit number"),
  attendees: z.array(attendeeSchema),
});

export default function EditRegistrationv1() {
  const [isEditing, setIsEditing] = useState(false);
  const [attendees, setAttendees] = useState([{ firstName: "", lastName: "" }]); // Store attendee details
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // Store selected event
  const [eventDate, setEventDate] = useState(""); // Store selected event date
  const [eventTimeList, setEventTimeList] = useState([]); // Store event times
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [attendanceCode, setAttendanceCode] = useState("");

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceCodeSchema),
  });

  const {
    register: editregister,
    handleSubmit: edithandlesubmit,
    setValue: editsetvalue,
    reset: editreset,
    control: editcontrol,
    formState: { errors: editerrors },
  } = useForm({
    defaultValues: {
      selected_time: selectedTime,
      selectedEvent: selectedEvent,
      attendees: attendees.map((attendee) => ({
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        attendeeid: attendee.attendeeid,
      })),
    },
    resolver: zodResolver(mainApplicantSchema),
  });


  const {
    fields: attendeeFields,
    append,
    remove,
  } = useFieldArray({
    control: editcontrol,
    name: "attendees",
  });

  const attendanceSubmit = async (data) => {
    try {
      const { data: dataAttendance, error } = await userAttendance(
        data.attendanceCode,
      );

      setAttendanceCode(dataAttendance[0].attendance_code);

      if (error) {
        console.error("Error fetching attendance:", error);
        alert(error); // Consider using a better UI for errors
        return;
      }

      if (!dataAttendance || dataAttendance.length === 0) {
        alert("No attendance found for the provided code.");
        return;
      }

      if (dataAttendance.length > 0) {
        const newAttendees = dataAttendance
          .filter(
            (item) =>
              item.attendee_first_name !== item.main_applicant_first_name ||
              item.attendee_last_name !== item.main_applicant_last_name,
          )
          .map((item) => ({
            attendeeid: item.id,
            firstName: item.attendee_first_name,
            lastName: item.attendee_last_name,
          }));


        setAttendees(newAttendees); // Update state with new attendees
        editsetvalue("attendees", newAttendees);
      }

      // Populate the edit form with the retrieved data
      setIsEditing(true);
      editsetvalue(
        "main_applicant_first_name",
        dataAttendance[0].main_applicant_first_name,
      );
      editsetvalue(
        "main_applicant_last_name",
        dataAttendance[0].main_applicant_last_name,
      );
      editsetvalue("telephone", dataAttendance[0].telephone);
      editsetvalue("selected_event", dataAttendance[0].selected_event);
      editsetvalue("selected_time", `${dataAttendance[0].selected_time}+00`);
      setSelectedEventId(dataAttendance[0].selected_event_id);

      // eventList.map(
      //   (event) =>{
      //     console.log(" sadfhodashuidashfuashifdsagiufgdisa name",event.name)
      //     // event.name === selectedEvent
      //   }
      //     // moment(event.schedule_date).isSame(moment(dataAttendance[0].seleted_event_date), 'day')
      // );

      const initialTimeList = eventList
        .filter((event) => {
          return (
            event.name === dataAttendance[0].selected_event &&
            moment(event.schedule_date).isSame(
              moment(dataAttendance[0].selected_event_date),
              "day",
            )
          );
        })
        .map((event) => {
          return event.time;
        })
        .flat();

      setEventTimeList(initialTimeList);

      setSelectedEvent(dataAttendance[0].selected_event);
      setEventDate(dataAttendance[0].selected_event_date);
      setSelectedTime(`${dataAttendance[0].selected_time}+00`);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the attendance.");
    }
  };
  const handleDeleteAttendee = async (id) => {

    if (id) {
      try {
        const { data, error } = await supabase
          .from("new_attendance")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting attendee:", error.message);
          return;
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }
  };

  const handleSubmitUpdateInformation = async (data) => {


    const {
      // selected_event: selectedEvent,
      // selected_time: selectedTime,
      main_applicant_first_name,
      main_applicant_last_name,
      telephone,
      attendees,
    } = data;

    // Prepare updates for attendees
    const updates = attendees.map((attendee) => {
      // If there's no attendeeid, omit it from the data
      const attendeeData = {
        attendee_first_name: attendee.firstName,
        attendee_last_name: attendee.lastName,
        main_applicant_first_name,
        main_applicant_last_name,
        selected_event_id: selectedEventId,
        telephone,
        selected_event_date: eventDate,
        selected_event: selectedEvent,
        selected_time: selectedTime,
      };
  
      // Only include 'id' if it exists
      if (attendee.attendeeid !== "") {
        attendeeData.id = attendee.attendeeid;
      }
  
      return attendeeData;
    });

    // Separate attendees with IDs (existing ones) from those without (new ones)
    const existingAttendees = updates.filter((update) => update.id);
    const newAttendees = updates.filter((update) => !update.id);

    // Fetch existing attendees from the database to check which need updating
    const { data: fetchedExistingAttendees, error: fetchError } = await supabase
      .from("new_attendance")
      .select("*")
      .in(
        "id",
        existingAttendees.map((update) => update.id),
      );

    if (fetchError) {
      console.error("Error fetching existing attendees:", fetchError);
      return;
    }

    // Get the list of IDs from the fetched records
    const existingIds = fetchedExistingAttendees.map((attendee) => attendee.id);
    const attendeesToUpdate = existingAttendees.filter((update) =>
      existingIds.includes(update.id),
    );

    // console.log("fetched attendees", fetchedExistingAttendees);
    // console.log("Attendees to update:", attendeesToUpdate);

    const attendeesToInsert = newAttendees.map((attendee) => ({
      ...attendee,
      attendance_code: attendanceCode,
      attendance_type: fetchedExistingAttendees[0]?.attendance_type ?? "family",
    }));


    try {
      // Update existing attendees
      const updateResults = await Promise.all(
        attendeesToUpdate.map(async (update) => {
          return supabase
            .from("new_attendance")
            .update(update)
            .eq("id", update.id);
        }),
      );

      // console.log("Updated attendees:", updateResults);

      // Insert new attendees
      const {error:insertError} = await Promise.all(
        attendeesToInsert.map(async (attendee) => {
          return supabase.from("new_attendance").insert(attendee);
        }),
      );

      if(insertError){
        throw new Error(insertError)
      }

      toast({
        title: "Success!",
        description: " Registration Updated Successfully",
      });
      closeModal();
    } catch (error) {
      console.error("Error updating/adding attendees:", error);
    }
  };

  const handleAddAttendee = () => {
    append({ attendeeid: "", firstName: "", lastName: "" });
    // setAttendees([...attendees, { firstName: "", lastName: "" }]);
  };

  const handleRemoveAttendee = (index, attendeeId) => {
    // const updatedAttendees = attendees.filter((_, i) => i !== index);
    // setAttendees(updatedAttendees);
    remove(index);
    handleDeleteAttendee(attendeeId);
  };

  const handleAttendeeInputChange = (index, field, value) => {
    const updatedAttendees = [...attendees];
    updatedAttendees[index][field] = value;
    setAttendees(updatedAttendees);
  };

  const closeModal = () => {
    editreset();
    setIsEditing(false);
  };

  useEffect(() => {
    // const convertedSelectedTime = moment.utc(selectedTime, "HH:mm:ss").format("hh:mm A")
    // console.log("converted time", convertedSelectedTime)
    editsetvalue("selected_time", selectedTime);
  }, [selectedTime, editsetvalue]);

  // fetch events
  // Fetch all events on component mount
  useEffect(() => {
    const fetchedEvents = async () => {
      try {
        const events = await fetchAllEvents();
        if (events.length > 0) {
          // console.log(events)
          setEventList(events);
        } else {
          console.error("No schedule found");
        }
      } catch (error) {
        console.error("Failed to load schedule", error);
      }
    };
    fetchedEvents();
  }, []);

  // console.log("attendee fields", attendeeFields);
  // console.log("attendees", attendees);

  return (
    <Dialog onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Registration</Button>
      </DialogTrigger>
      <DialogContent className={clsx('sm:max-w-md md:w-fit overflow-scroll no-scrollbar', { 'h-full md:h-[30rem]': isEditing })}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Registration" : "Enter Code"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your registration details."
              : "Enter the code to make changes to your registration."}
          </DialogDescription>
        </DialogHeader>

        {/* Code Input Form */}
        {!isEditing && (
          <form onSubmit={handleSubmit(attendanceSubmit)}>
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="code">Attendance Code</Label>
                <Input
                  id="code"
                  type="text" // Change to text for regex validation
                  placeholder="Enter your code"
                  {...register("attendanceCode")}
                  className="col-span-6"
                  required
                />
                {errors.attendanceCode && (
                  <span className="text-red-500">
                    {errors.attendanceCode.message}
                  </span>
                )}
              </div>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        )}

        {/* Edit Registration Form */}
        {isEditing && (
          <form
            onSubmit={edithandlesubmit((handleSubmitUpdateInformation))}
            className="no-scrollbar h-full md:max-h-[30rem] "
          >
            <div className="grid w-full items-center gap-4 p-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="event">Upcoming Events</Label>

                <Select
                  value={selectedEvent}
                  {...editregister("selected_event")}
                  onValueChange={(value) => {
                    // console.log(value)
                    const selectedEventDetails = eventList.find(
                      (item) => item.name === value,
                    );
                    if (selectedEventDetails) {
                      setSelectedEvent(selectedEventDetails.name);
                      setEventDate(selectedEventDetails.schedule_date);
                      setEventTimeList(selectedEventDetails.time);
                      editsetvalue("selected_event", value);
                      editsetvalue("selected_time", "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event">
                      {selectedEvent || "Select Event"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {eventList.map((event) => (
                      <SelectItem key={event.id} value={event.name}>
                        {`${event.name} (${moment(event.schedule_date).format("MMMM Do YYYY")})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEvent && (
                  <span>
                    Event Date:{" "}
                    <strong>{moment(eventDate).format("MMMM Do YYYY")}</strong>
                  </span>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="selected_time">Select Time</Label>
                <Controller
                  name="selected_time"
                  control={editcontrol}
                  rules={{ required: "Time is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTimeList.map((time, index) => (
                          <SelectItem key={index} value={time}>
                            {moment.utc(time, "HH:mm:ss").format("hh:mm A")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {editerrors.selected_time && (
                  <span className="text-red-500">
                    {editerrors.selected_time.message}
                  </span>
                )}
              </div>

              <Label>Main Applicant</Label>
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="flex flex-col md:w-1/3">
                  <Input
                    {...editregister("main_applicant_first_name")}
                    placeholder="First name"
                    className="w-full"
                  />
                  {editerrors.main_applicant_first_name && (
                    <p className="text-red-500">
                      {editerrors.main_applicant_first_name.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col md:w-1/3">
                  <Input
                    {...editregister("main_applicant_last_name")}
                    placeholder="Last name"
                    className="w-full"
                  />
                  {editerrors.main_applicant_last_name && (
                    <p className="text-red-500">
                      {editerrors.main_applicant_last_name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:w-1/3">
                  <Input
                    {...editregister("telephone")}
                    placeholder="Telephone"
                    className="w-full"
                  />
                  {editerrors.telephone && (
                    <p className="text-red-500">
                      {editerrors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              <Label>Attendee Information</Label>

              {attendeeFields.map((attendee, index) => (
                <div
                  key={attendee.id}
                  className="flex flex-col gap-2 md:flex-row"
                >
                  <div className="flex flex-col">
                    <Controller
                      name={`attendees.${index}.firstName`}
                      control={editcontrol}
                      render={({ field }) => (
                        <Input {...field} placeholder="First name" />
                      )}
                    />
                    {editerrors.attendees?.[index]?.firstName && (
                      <span className="text-red-500">
                        {editerrors.attendees[index].firstName.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <Controller
                      name={`attendees.${index}.lastName`}
                      control={editcontrol}
                      render={({ field }) => (
                        <Input {...field} placeholder="Last name" />
                      )}
                    />
                    {editerrors.attendees?.[index]?.lastName && (
                      <span className="text-red-500">
                        {editerrors.attendees[index].lastName.message}
                      </span>
                    )}
                  </div>

                  <Controller
                    name={`attendees.${index}.attendeeid`}
                    control={editcontrol}
                    render={({ field }) => <Input type="hidden" {...field} />}
                  />

                  {/* Remove Button */}
                  {attendeeFields.length > 0 && (
                    <Button
                      type="button"
                      onClick={() =>
                        handleRemoveAttendee(index, attendee.attendeeid)
                      }
                    >
                      Remove
                    </Button>
                  )}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
