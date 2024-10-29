import { useEffect, useState } from "react";
import qrScannerIcon from "../../assets/svg/qrScanner.svg";
import QrReader from "react-qr-reader";
import { Button } from "@/shadcn/button";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from "../../shadcn/dialog";
import { DialogHeader } from "../shadcn/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../shadcn/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import moment from "moment";
import supabase from "@/api/supabase";
import { useUser } from "../../authentication/useUser";

const ParishionerQRCodeScanner = () => {
  const [eventData, setEventData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]); // State to hold family members
  const [selectedMembers, setSelectedMembers] = useState([]); // Store selected members as objects
  const [guardianData, setGuardianData] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [error, setError] = useState(""); // State to hold error messages
  const [successMessage, setSuccessMessage] = useState(""); // State to hold success messages

  const user = useUser(); // Retrieve user data from the custom hook

  const handleScan = async (scanData) => {
    if (scanData && scanData != "") {
      await fetchedScanEvent(scanData); // Pass scanData
      setOpenDialog(false);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const fetchedScanEvent = async (event_UUID) => {
    try {
      const { data, error } = await supabase
        .from("schedule")
        .select("*")
        .eq("event_uuid", event_UUID);

      if (error) throw error;

      setEventData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFamilyMembers = async () => {
    if (!user || !user.user || !user.user.id) {
      console.error("User data not available");
      return;
    }

    try {
      // Fetch user data based on user UUID
      const { data: userData, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_uuid", user.user.id)
        .single();

      //   if (error || !userData) {
      //     console.error(
      //       "Error fetching user data:",
      //       error?.message,
      //       error?.details,
      //     );
      //     return;
      //   }
      setGuardianData(userData);

      // Use the fetched user data to get family members based on guardian ID
      const { data, error: fetchError } = await supabase
        .from("family_list")
        .select("*")
        .eq("guardian_id", userData.user_id); // Using userData.user_id as guardian ID

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        console.warn(
          "No family members found for this guardian ID:",
          userData.user_id,
        );
      }
      setFamilyMembers(data);
    } catch (error) {
      console.error("Error fetching family members:", error.message);
    }
  };

  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedTime) {
      setError("Please select a time.");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Please select at least one family member.");
      return;
    }

    try {
      // Array to hold names of family members who have already attended
      const alreadyAttendedMembers = [];

      // First, check if any family member has already attended
      for (const member of selectedMembers) {
        const { data: existingAttendance, error: fetchError } = await supabase
          .from("new_attendance")
          .select("id")
          .eq("attendee_first_name", member.family_first_name)
          .eq("attendee_last_name", member.family_last_name)
          .eq("selected_event", eventData[0]?.name || "Unknown Event");

        if (fetchError) throw fetchError;

        if (existingAttendance.length > 0) {
          alreadyAttendedMembers.push(
            `${member.family_first_name} ${member.family_last_name}`,
          );
        }
      }

      // If any member has already attended, show alert and stop the function
      if (alreadyAttendedMembers.length > 0) {
        alert(
          `The following members have already attended:\n${alreadyAttendedMembers.join("\n")}`,
        );
        return; // Stop further execution
      }

      // Proceed to insert attendance records if no member has already attended
      for (const member of selectedMembers) {
        const { error: insertError } = await supabase
          .from("new_attendance")
          .insert({
            main_applicant_first_name: !member.guardian
              ? guardianData.user_name
              : "N/A",
            main_applicant_last_name: !member.guardian
              ? guardianData.user_last_name
              : null,
            telephone: !member.guardian ? guardianData.user_contact : "N/A",
            attendee_first_name: member.family_first_name,
            attendee_last_name: member.family_last_name,
            has_attended: true,
            selected_time: selectedTime,
            selected_event_date: eventData[0]?.schedule_date || null,
            attendance_type: "family",
            selected_event: eventData[0]?.name || "Unknown Event",
            selected_event_id: eventData[0]?.event_uuid || null,
          });

        if (insertError) throw insertError;
      }

      // Show success message if all records are inserted
      setSuccessMessage("Attendance successfully submitted!");
      setError("");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error submitting attendance data:", error);
      setError("An error occurred while submitting attendance data.");
    }
  };

  const handleTimeChange = (value) => {
    setSelectedTime(value);
    setError(""); // Clear error when the time is selected
  };

  const handleMemberChange = (member) => {
    setSelectedMembers((prev) => {
      // Check if the member is already selected
      const isSelected = prev.some(
        (m) => m.family_member_id === member.family_member_id,
      );
      if (isSelected) {
        // Remove member if already selected
        return prev.filter(
          (m) => m.family_member_id !== member.family_member_id,
        );
      } else {
        // Add member if not selected
        return [...prev, member];
      }
    });
    setError(""); // Clear error when a member is selected
  };

  // Function to format time to 9:00 AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split("+")[0].split(":");
    const hours12 = hours % 12 || 12; // Convert to 12-hour format
    const ampm = hours < 12 ? "AM" : "PM"; // Determine AM/PM
    return `${hours12}:${minutes.padStart(2, "0")} ${ampm}`; // Return formatted time
  };

  return (
    <Dialog onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="ml-2">
          <img src={qrScannerIcon} alt="QR Code Scanner Image" />
        </Button>
      </DialogTrigger>
      <DialogHeader>
        <DialogTitle className="sr-only"></DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>
      </DialogHeader>
      <DialogContent>
        {openDialog && (
          <QrReader
            facingMode={"environment"}
            delay={1000}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "100%" }}
          />
        )}
        {!openDialog && (
          <>
            {eventData.map((item) => (
              <Card key={item.event_uuid}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                  <p>Organiser: {item.creator_name}</p>
                  <p>{moment(item.schedule_date).format("MMMM DD YYYY")}</p>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTime} onValueChange={handleTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {item.time.map((time, index) => (
                        <SelectItem key={index} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-4 text-sm text-gray-600">
                    Please select the family members who will attend the event:
                  </p>

                  <div className="mt-4 space-y-4">
                    {familyMembers.map((member) => (
                      <div
                        key={member.family_member_id}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          id={`member-${member.family_member_id}`}
                          checked={selectedMembers.some(
                            (m) =>
                              m.family_member_id === member.family_member_id,
                          )}
                          onChange={() => handleMemberChange(member)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`member-${member.family_member_id}`}
                          className="ml-2 text-sm"
                        >
                          {member.family_first_name} {member.family_last_name}
                        </label>
                      </div>
                    ))}
                  </div>

                  {error && <p className="mt-4 text-red-600">{error}</p>}
                  {successMessage && (
                    <p className="mt-4 text-green-600">{successMessage}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmit}>Submit</Button>
                </CardFooter>
              </Card>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ParishionerQRCodeScanner;
