import ScheduleLinks from "../../components/admin/schedule/ScheduleLinks";
import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import moment from "moment";
import QRCode from "react-qr-code";
import { useForm } from "react-hook-form";
import Table from "../../components/Table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { Calendar } from "../../shadcn/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../shadcn/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../shadcn/pagination"; // Adjusted imports for pagination
import Spinner from "../../components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../shadcn/alert-dialog";
import { Icon } from "@iconify/react";
import { fetchCategory, fetchSubCategory } from "../../api/userService";

import { Textarea } from "../../shadcn/textarea";

import { useNavigate } from "react-router-dom";
import QRCodeIcon from "../../assets/svg/qrCode.svg";
import { useUser } from "../../context/UserContext";
import EventFilter from "../../components/admin/Event/EventFilter";
import EventAttendance from "@/components/volunteer/schedule/EventAttendance";
const headers = [
  "QR Code",
  "Attendance",
  "Event Name",
  "Date",
  "Time",
  "Organiser",
];

export default function VolunteerEvents() {
  const { userData, userGroups } = useUser(); // Destructure userData directly
  console.log(userGroups);

  const navigate = useNavigate();

  const [time, setTime] = useState([]); // event time data
  const [selectedDate, setSelectedDate] = useState(null); // event date data
  const [selectedVisibility, setSelectedVisibility] = useState("Public"); // event date data
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // for disabling the button submission
  const [events, setEvents] = useState([]); // Event data
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [totalPages, setTotalPages] = useState(0); // pagination
  const [loading, setLoading] = useState(false); // Loading handling
  const [error, setError] = useState(null); // Error Handling
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog Open/Close
  const [editId, setEditId] = useState(null); // Get the current ID of Event
  const [categoryData, setCategoryData] = useState([]); // List of category
  const [selectedCategory, setSelectedCategory] = useState(""); // If selected category, show sub category
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [qrCodeValue, setQrCodeValue] = useState(""); // QR Code value
  const itemsPerPage = 8;
  const [groupData, setGroupData] = useState([]); // List of category
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm(); // react-hook-forms
  const generateTimeOptions = () => {
    const times = [];
    const start = 0; // Start at midnight (00:00)
    const end = 24 * 60; // End at 23:45 (1440 minutes)

    for (let time = start; time < end; time += 15) {
      const hours = String(Math.floor(time / 60)).padStart(2, "0");
      const minutes = String(time % 60).padStart(2, "0");
      times.push(`${hours}:${minutes}`);
    }

    return times;
  };

  const timeOptions = generateTimeOptions();
  // Handler for year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
    fetchEvents(year, selectedMonth); // Fetch events with updated year
  };

  // Handler for month change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    fetchEvents(selectedYear, month); // Fetch events with updated month
  };

  const onSubmit = async (data) => {
    setIsSubmitted(true);

    if (!selectedDate) {
      console.error("Date is required.");
      return;
    }

    if (!selectedVisibility) {
      // Updated to use selectedVisibility
      console.error("Schedule privacy is required.");
      return;
    }

    try {
      // Prepare the event data
      const eventData = {
        name: data.name,
        schedule_date: selectedDate.format("YYYY-MM-DD"),
        time: time,
        schedule_privacy: selectedVisibility, // Use selectedVisibility for schedule_privacy
        description: data.description,
        schedule_category: selectedCategoryName,
        schedule_sub_category: data.schedule_sub_category,
        creator_id: userData?.user_id, // Assuming userData contains the creator's ID
        creator_name: `${userData?.user_name} ${userData?.user_last_name}`, // Creator's full name
        group_id: selectedVisibility === "group" ? selectedGroupId : null, // Group ID if visibility is "group"
        group_name: selectedVisibility === "group" ? selectedGroupName : null, // Group name if visibility is "group"
      };

      if (editId) {
        // Update existing event
        const { error } = await supabase
          .from("schedule")
          .update(eventData)
          .eq("id", editId);

        if (error) throw error;
        fetchEvents();
        alert("Event updated successfully!");
      } else {
        // Insert new event
        const { error } = await supabase.from("schedule").insert([eventData]);

        if (error) {
          console.error("Error inserting data:", error.message);
          alert(
            "An error occurred while creating the event. Please try again.",
          );
        } else {
          alert("Event created successfully!");
        }
      }

      resetForm(); // Reset the form after successful operation
      setIsDialogOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const resetForm = () => {
    reset();
    setTime([""]);
    setSelectedCategoryName("");
    setSelectedDate(null);
    setIsSubmitted(false);
    setEditId(null); // Reset editId when resetting the form
  };

  const handleDateSelect = (date) => {
    setSelectedDate(moment(date));
    setValue("schedule", date);
  };

  const fetchEvents = useCallback(
    async (year, month) => {
      setLoading(true);
      setError(null);

      try {
        // Format the month to ensure two digits (e.g., 01 for January, 10 for October)
        const formattedMonth = month + 1; // Adjust to 1-12 for month
        const monthStr =
          formattedMonth < 10 ? `0${formattedMonth}` : `${formattedMonth}`;
        const yearStr = year;

        const {
          data: fetchedData,
          error,
          count,
        } = await supabase
          .from("schedule")
          .select("*", { count: "exact" })
          .filter("schedule_date", "like", `${yearStr}-${monthStr}%`) // Filter by year and month (e.g., "2024-11%")
          .range(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage - 1,
          );

        if (error) throw error;

        setTotalPages(Math.ceil(count / itemsPerPage));
        setEvents(fetchedData);
      } catch (err) {
        setError("Error fetching events. Please try again.");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage],
  );

  useEffect(() => {
    if (selectedYear && selectedMonth !== null) {
      fetchEvents(selectedYear, selectedMonth); // Pass the selectedYear and selectedMonth
    }
  }, [selectedYear, selectedMonth, fetchEvents]);

  // Format the time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return moment(timeString, "HH:mm").format("hh:mm A"); // Use Moment.js to format time
  };

  //Delete Event
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("schedule").delete().eq("id", id);

      if (error) throw error;

      // Refresh data after deletion
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Update Event
  const handleEditBtn = async (id) => {
    try {
      const itemToEdit = events.find((item) => item.id === id);
      if (itemToEdit) {
        reset(); // Reset the entire form to initial values before editing
        setValue("name", itemToEdit.name);
        setSelectedDate(moment(itemToEdit.schedule_date)); // Set the date for Calendar
        setValue("schedule_privacy", itemToEdit.schedule_privacy);
        setValue("schedule_category", itemToEdit.schedule_category);
        setValue("scheudle_sub_category", itemToEdit.schedule_sub_category);
        setValue("description", itemToEdit.description || "");
        if (itemToEdit.time && Array.isArray(itemToEdit.time)) {
          // Map through the time array and format each time
          const formattedTimes = itemToEdit.time.map((t) =>
            moment.utc(t, "HH:mm:ssZ").format("HH:mm"),
          );

          setTime(formattedTimes);
        }
        setEditId(id); // Set the editId to the current event's id
      }
    } catch (error) {
      console.error("Error Updating Event", error);
    }
  };

  // Add more time
  const handleAddTimeInput = () => {
    setTime([...time, ""]);
  };

  // Remove time
  const handleRemoveTimeInput = (index) => {
    if (time.length > 1) {
      const updatedTimes = time.filter((_, i) => i !== index);
      setTime(updatedTimes); // Remove the specific time input field
    }
  };

  // Function to change time
  const handleChangeTime = (index, value) => {
    const updatedTimes = [...time];
    updatedTimes[index] = value;
    setTime(updatedTimes);
  };

  // Generate QR Code
  const handleGenerateQRCode = (value) => {
    setQrCodeValue(value);
  };

  const rows = events.map((event) => [
    <AlertDialog key={event.id}>
      <AlertDialogTrigger
        asChild
        onClick={() => handleGenerateQRCode(event.event_uuid)}
      >
        <Button className="p-4">
          <img src={QRCodeIcon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Event Information</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="sr-only">
          QR Code
        </AlertDialogDescription>
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 256,
            width: "100%",
          }}
        >
          <QRCode
            size={256}
            style={{ maxWidth: "100%", width: "100%" }}
            value={qrCodeValue}
            viewBox={`0 0 256 256`}
          />
        </div>
        <h2>Event Name: {event.name}</h2>
        <p>Date: {moment(event.schedule_date).format("MMMM Do YYYY")}</p>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
    <EventAttendance key={event.id} event_uuid={event.event_uuid} />,
    event.name,
    moment(event.schedule_date).format("MMMM Do YYYY"), // Format date using Moment.js
    event.time && event.time.length > 0
      ? event.time.map((t) => formatTime(t)).join(", ")
      : "N/A",
    <div
      key={event.name}
      style={{
        maxWidth: "200px",
        maxHeight: "100px",
        overflow: "auto",
        whiteSpace: "pre-wrap",
      }}
    >
      {event.creator_name || "N/A"}
    </div>,

    <DropdownMenu key={event.id}>
      <DropdownMenuTrigger>
        <button aria-label="Options">
          <Icon icon="tabler:dots" width="2em" height="2em" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={() => handleEditBtn(event.id)}
                className="h-full w-full p-2 text-left"
              >
                Edit
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription className="sr-only">
                Edit Event
              </AlertDialogDescription>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      Event name is required
                    </p>
                  )}
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="schedule">Date</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedDate
                          ? selectedDate.format("MMMM Do YYYY")
                          : "Please select a date"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto p-5">
                      <Calendar
                        mode="single"
                        selected={selectedDate ? selectedDate.toDate() : null}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </DialogContent>
                  </Dialog>
                  {isSubmitted && !selectedDate && (
                    <p className="text-sm text-red-500">Date is required</p>
                  )}
                </div>

                {/* Event Category */}
                <div className="space-y-2">
                  <Label htmlFor="Event Category">Event Category</Label>
                  <div className="flex gap-x-2">
                    <div>
                      <Select
                        value={watch("schedule_category")}
                        onValueChange={(value) => {
                          const selectedCategory = categoryData.find(
                            (item) => item.category_id === value,
                          );
                          if (selectedCategory) {
                            setSelectedCategoryName(
                              selectedCategory.category_name,
                            );
                            setValue("schedule_category", value);
                            fetchSubCategories(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryData.map((item) => (
                            <SelectItem
                              key={item.category_id}
                              value={item.category_id}
                            >
                              {item.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.schedule_category && (
                        <p className="text-sm text-red-500">
                          {errors.schedule_category.message}
                        </p>
                      )}
                    </div>
                    <div>
                      {selectedCategoryName &&
                        selectedSubCategory.length > 0 && (
                          <Select
                            onValueChange={(value) => {
                              setValue("schedule_sub_category", value);
                            }}
                          >
                            <SelectTrigger className="w-[180px] text-start">
                              <SelectValue placeholder="Sub category" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedSubCategory.map((item) => (
                                <SelectItem
                                  key={item.sub_category_id}
                                  value={item.sub_category_name}
                                >
                                  {item.sub_category_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      {errors.schedule_sub_category && (
                        <p className="text-sm text-red-500">
                          {errors.schedule_sub_category.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schedule Privacy (Visibility) */}
                <div className="space-y-2">
                  <Label htmlFor="schedule_privacy">Schedule Visibility</Label>
                  <Select
                    value={watch("schedule_privacy")}
                    onValueChange={(value) => {
                      setValue("schedule_privacy", value);
                      setSelectedVisibility(value); // Store the selected visibility
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.schedule_privacy && (
                    <p className="text-sm text-red-500">
                      {errors.schedule_privacy.message}
                    </p>
                  )}
                </div>

                {/* Group Selection (only shows if "Group" visibility is selected) */}
                {selectedVisibility === "group" && (
                  <div className="ml-4 space-y-2">
                    <Label htmlFor="user_group">Select Ministry</Label>
                    <Select
                      onValueChange={(value) => {
                        const selectedGroup = userGroups.find(
                          (group) => group.group_id === value,
                        );
                        if (selectedGroup) {
                          setSelectedGroupId(value); // Set selected group ID
                          setSelectedGroupName(selectedGroup.group_name); // Set selected group name for display
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px] text-start">
                        <SelectValue placeholder="Select Ministry">
                          {selectedGroupName || "Select Ministry"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {userGroups.map((group) => (
                          <SelectItem
                            key={group.group_id}
                            value={group.group_id}
                          >
                            {group.group_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.user_group && (
                      <p className="text-sm text-red-500">
                        {errors.user_group.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  {time.map((t, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={t}
                        onValueChange={(value) =>
                          handleChangeTime(index, value)
                        }
                        className="flex-grow"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="HH:MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveTimeInput(index)}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddTimeInput}
                    className="w-full"
                  >
                    Add Time
                  </Button>
                </div>

                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction type="submit">Save</AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="h-full w-full p-2 text-left">Delete</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(event.id)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const data = await fetchCategory();
      setCategoryData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const data = await fetchSubCategory(categoryId);
      setSelectedSubCategory(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCategories(); // Ensure categories are fetched first

        // After categories are fetched, check if there's a selected category
        if (selectedCategory) {
          await fetchSubCategories(selectedCategory); // Fetch subcategories with the selected category ID
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [selectedCategory]);

  console.log("i am here")

  return (
    <ScheduleLinks>
      <div className="mt-2 flex gap-x-2">
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              resetForm(); // Call your form reset function here
            }
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>New Event</Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-[700px] h-full md:h-fit">
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
              <DialogDescription>Schedule an upcoming event.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  placeholder="Add event name here"
                  id="name"
                  {...register("name", { required: true })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">Event name is required</p>
                )}
              </div>

              {/* Event Category */}
              <div className="flex">
                <div className="space-y-2">
                  <Label htmlFor="Event Category">Event Category</Label>
                  <div className="flex gap-x-2">
                    <div>
                      <Select
                        onValueChange={(value) => {
                          const selectedCategory = categoryData.find(
                            (item) => item.category_id === value,
                          );
                          if (selectedCategory) {
                            setSelectedCategoryName(
                              selectedCategory.category_name,
                            );
                            setValue("schedule_category", value);
                            fetchSubCategories(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Category">
                            {selectedCategoryName || "Select Category"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categoryData.map((item) => (
                            <SelectItem
                              key={item.category_id}
                              value={item.category_id}
                            >
                              {item.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.schedule_category && (
                        <p className="text-sm text-red-500">
                          {errors.schedule_category.message}
                        </p>
                      )}
                    </div>
                    <div>
                      {selectedCategoryName &&
                        selectedSubCategory.length > 0 && (
                          <Select
                            onValueChange={(value) => {
                              setValue("schedule_sub_category", value);
                            }}
                          >
                            <SelectTrigger className="w-[180px] text-start">
                              <SelectValue placeholder="Sub category" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedSubCategory.map((item) => (
                                <SelectItem
                                  key={item.sub_category_id}
                                  value={item.sub_category_name}
                                >
                                  {item.sub_category_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      {errors.schedule_sub_category && (
                        <p className="text-sm text-red-500">
                          {errors.schedule_sub_category.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Event Visibility */}
                <div className="ml-4 space-y-2">
                  <Label htmlFor="schedule_visibility">Event Visibility</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue("schedule_visibility", value);
                      setSelectedVisibility(value); // Update visibility state
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="group">Ministry</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.schedule_visibility && (
                    <p className="text-sm text-red-500">
                      {errors.schedule_visibility.message}
                    </p>
                  )}
                </div>

                {/* Group Selection (only shows if "Group" visibility is selected) */}
                {selectedVisibility === "group" && (
                  <div className="ml-4 space-y-2">
                    <Label htmlFor="user_group">Select Ministry</Label>
                    <Select
                      onValueChange={(value) => {
                        const selectedGroup = userGroups.find(
                          (group) => group.group_id === value,
                        );
                        if (selectedGroup) {
                          setSelectedGroupId(value); // Set selected group ID
                          setSelectedGroupName(selectedGroup.group_name); // Set selected group name for display
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px] text-start">
                        <SelectValue placeholder="Select Ministry">
                          {selectedGroupName || "Select Ministry"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {userGroups.map((group) => (
                          <SelectItem
                            key={group.group_id}
                            value={group.group_id}
                          >
                            {group.group_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.user_group && (
                      <p className="text-sm text-red-500">
                        {errors.user_group.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="flex gap-x-5">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Date</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        {selectedDate
                          ? selectedDate.format("MMMM Do YYYY")
                          : "Please select a date"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-auto p-5">
                      <Calendar
                        mode="single"
                        selected={selectedDate ? selectedDate.toDate() : null}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </DialogContent>
                  </Dialog>
                  {isSubmitted && !selectedDate && (
                    <p className="text-sm text-red-500">Date is required</p>
                  )}
                </div>

                {/* Time Selection */}
                <div>
                  <Label htmlFor="time">Time</Label>
                  <div className="h-28 space-y-2 overflow-y-scroll">
                    {time.map((t, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Select
                          value={t}
                          onValueChange={(value) =>
                            handleChangeTime(index, value)
                          }
                          className="flex-grow"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="HH:MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveTimeInput(index)}
                          className="shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={handleAddTimeInput}
                      className="w-full"
                    >
                      Add Time
                    </Button>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  {...register("description")}
                  className="w-full"
                  placeholder="Event description (optional)"
                />
              </div>

              <DialogFooter className="gap-y-2">
                <DialogClose asChild>
                  <Button type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* <Button onClick={handleNavigation}>Overview</Button> */}

        {/* <CreateMeeting />
            <CreatePoll /> */}
      </div>
      <EventFilter
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <Table headers={headers} rows={rows} />
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
              >
                Previous
              </PaginationPrevious>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    active={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
              >
                Next
              </PaginationNext>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </ScheduleLinks>
  );
}
