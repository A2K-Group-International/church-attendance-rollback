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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { userAttendance, fetchAllEvents } from "@/api/userService";
import moment from "moment";
import supabase from "@/api/supabase";
import { useToast } from "@/shadcn/use-toast";

const attendanceCodeSchema = z.object({
  attendanceCode: z
    .string()
    .length(6, "Attendance code must be exactly 6 digits.")
    .regex(/^\d{6}$/, "Attendance code must be a number."),
});

export default function EditRegistrationv1() {
  const [isEditing, setIsEditing] = useState(false);
  const [attendees, setAttendees] = useState([{ firstName: "", lastName: "" }]); // Store attendee details
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(""); // Store selected event
  const [eventDate, setEventDate] = useState(""); // Store selected event date
  const [eventTimeList, setEventTimeList] = useState([]); // Store event times
  const [selectedTime, setSelectedTime] = useState("");
  const [id, setId] = useState("");

  const {toast} = useToast()

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
    },
  });

  const attendanceSubmit = async (data) => {
    try {
      const { data: dataAttendance, error } = await userAttendance(
        data.attendanceCode,
      );

      // console.log("data attendance", dataAttendance);

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
        const newAttendees = dataAttendance.map((item) => ({
          id: item.id,
          firstName: item.attendee_first_name,
          lastName: item.attendee_last_name,
        }));
        setAttendees(newAttendees); // Update state with new attendees
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
      setId(dataAttendance.id);

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

      // console.log("timelist ko", initialTimeList);

      setEventTimeList(initialTimeList);

      setSelectedEvent(dataAttendance[0].selected_event);
      setEventDate(dataAttendance[0].selected_event_date);
      setSelectedTime(`${dataAttendance[0].selected_time}+00`);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while submitting the attendance.");
    }
  };

  const handleSubmitUpdateInformation = async (data) => {
    // console.log("data from hook form", data);
    // Data contains all fields registered with useForm

    // console.log("data",data)
    const {
      selected_event,
      selected_time,
      main_applicant_first_name,
      main_applicant_last_name,
      telephone,
    } = data;

    // Optionally add attendees if they need to be updated
    // const updatedAttendees = attendees.map((attendee) => ({
    //   firstName: attendee.firstName,
    //   lastName: attendee.lastName,
    // }));

    // console.log("attendeess",attendees)
    const updates = attendees.map((attendee) => ({
      id: attendee.id,
      attendee_first_name: attendee.firstName,
      attendee_last_name: attendee.lastName,
      main_applicant_first_name,
      main_applicant_last_name,
      telephone,
      selected_event,
      selected_time,
    }));
    
    // Update each attendee based on their ID
    const { error: dataError } = await Promise.all(
      updates.map(async (update) => {
        return supabase
          .from("new_attendance")
          .update(update)
          .eq("id", update.id);
      })
    );

  
    
    

    if (dataError) {
      throw new Error(dataError);
    }

    // console.log("updated succeessfully");

    // updatedAttendees.map(()=>{})

    // try {
    //   const { error } = await supabase
    //     .from("new_attendance")
    //     .update({
    //       selected_event,
    //       selected_time,
    //       main_applicant_first_name,
    //       main_applicant_last_name,
    //       telephone,
    //       attendees: updatedAttendees, // Include attendees if needed
    //     })
    //     .eq("id", id);
    //   // .eq('id', eventId);

    //   if (error) throw error;

    //   console.log("Update successful");
    // } catch (error) {
    //   console.error("Error updating registration data:", error.message);
    // }
    toast({
      title:"Success!",
      description:" Registration Updated Successfully"
    })
    closeModal();
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
    editreset();
    setIsEditing(false);
  };

  useEffect(() => {
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

  // console.log(attendees)

  return (
    <Dialog onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Registration</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
            onSubmit={edithandlesubmit(handleSubmitUpdateInformation)}
            className="no-scrollbar max-h-[30rem] overflow-scroll"
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
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event">
                      {selectedEvent || "Select Event"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {eventList
                    .map((event) => (
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
                <Controller
                  name="selected_time"
                  control={editcontrol}
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
              </div>

              <Label>Parent/Carer Information</Label>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  {...editregister("main_applicant_first_name",{required:true})}
                  placeholder="First name"
                  className="w-full md:w-1/3"
                />
                <Input
                  {...editregister("main_applicant_last_name",{required:true})}
                  placeholder="Last name"
                  className="w-full md:w-1/3"
                />
                <Input
                  {...editregister("telephone",{required:true})}
                  placeholder="Telephone"
                  className="w-full md:w-1/3"
                />
              </div>

              <Label>Attendee Information</Label>
              
              {attendees.map((attendee, index) => (
                <div key={index} className="flex flex-col gap-2 md:flex-row">
                  <Input
                    value={attendee.firstName}
                    // {...editregister(`attendee_first_name${index}`,{required:true})}
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
                    // {...editregister(`attendee_last_name${index}`,{required:true})}
                    onChange={(e) =>
                      handleAttendeeInputChange(
                        index,
                        "lastName",
                        e.target.value,
                      )
                    }
                    placeholder="Last name"
                  />
                  {attendees.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => handleRemoveAttendee(index)}
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
