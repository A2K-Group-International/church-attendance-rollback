import { Separator } from "@/shadcn/separator";
import kebab from "@/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/button";
import { Calendar } from "@/shadcn/calendar";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/shadcn/dialog";
import useClassAssignment from "@/hooks/useClassAssignment";
import useUserData from "@/api/useUserData";
import { zodResolver } from "@hookform/resolvers/zod";
import { addquizSchema, editQuizSchema } from "@/lib/zodSchema/classSchema";
import Spinner from "@/components/Spinner";

export default function VolunteerAssignment() {
  const [date, setDate] = useState("");
  const { userData } = useUserData();
  const { id } = useParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors: addErrors },
  } = useForm({ resolver: zodResolver(addquizSchema) });
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    control: editControl,
    reset: editReset,
    setValue: editSetValue,
    formState: { errors: editErrors },
  } = useForm({ resolver: zodResolver(editQuizSchema) });

  const {
    error,
    assignments,
    isLoading,
    deleteAssignmentMutation,
    updateAssignmentMutation,
    addAssignmentMutation,
  } = useClassAssignment(id);

  if (isLoading || !userData) {
    return <Spinner />;
  }

  if (error) {
    return <p>not found</p>;
  }

  if (assignments.length < 1 && userData?.user_role === "user") {
    return (
      <div className="flex justify-center">
        <p>nothing here yet.</p>
      </div>
    );
  }

  console.log(editErrors);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
      {userData?.user_role === "volunteer" && (
        <form
          onSubmit={handleSubmit((inputs) =>
            addAssignmentMutation.mutate({
              inputs,
              date,
              class_id: id,
              reset,
              setDate,
            }),
          )}
          className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
        >
          <Label className="text-md font-bold">Title</Label>
          <Input
            {...register("title")}
            placeholder={"Create assignment title"}
          />
          {addErrors.title && (
            <p className="text-red-500">{addErrors.title.message}</p>
          )}
          <Label className="text-md font-bold">Description</Label>
          <Textarea
            {...register("description")}
            placeholder={"Create assignment description"}
            className="mb-1"
          />
          {addErrors.description && (
            <p className="text-red-500">{addErrors.description.message}</p>
          )}
          <Label className="text-md font-bold">Quiz Link</Label>
          <Input
            {...register("quiz_link")}
            placeholder={"Place link here"}
            className="mb-2"
          />
          {addErrors.quiz_link && (
            <p className="text-red-500">{addErrors.quiz_link.message}</p>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex flex-col">
              <Controller
                name="participant"
                control={control}
                // rules={}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    value={field.value}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assignment For:" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Participants</SelectLabel>
                        <SelectItem value="child">Children</SelectItem>
                        <SelectItem value="parent">Parents</SelectItem>
                        <SelectItem value="volunteer">Volunteers</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {addErrors.participant && (
                <p className="text-red-500">{addErrors.participant.message}</p>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon />
                  {date ? format(date, "PPP") : <span>Pick due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {addErrors.due_date && (
              <p className="text-red-500">{addErrors.due_date.message}</p>
            )}

            <Button disabled={addAssignmentMutation.isPending} type="submit">
              {addAssignmentMutation.isPending ? "Adding Quiz" : "Add Quiz"}
            </Button>
          </div>
        </form>
      )}
      {assignments?.map((assignment, index) => (
        <div
          key={index}
          className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p>{assignment.title}</p>
              <p className="text-sm">Posted: {assignment.created_at}</p>
            </div>
            <div className="flex flex-col items-end">
              <Popover>
                <PopoverTrigger>
                  {userData?.user_role === "volunteer" && (
                    <img src={kebab} className="h-6 w-6" alt="kebab" />
                  )}
                </PopoverTrigger>
                <PopoverContent align="end" className="w-28 p-0">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(isOpen) => {
                      if (isOpen) {
                        editSetValue("edittitle", assignment.title);
                        editSetValue("editdescription", assignment.description);
                        editSetValue("editquizlink", assignment.quiz_link);
                        editSetValue("editparticipant", assignment.quiz_for);
                        setDate(assignment.due);
                      } else {
                        setDate("");
                      }
                      setIsEditDialogOpen(isOpen);
                    }}
                  >
                    <DialogTrigger className="w-full">
                      {userData?.user_role === "volunteer" && (
                        <div className="w-full p-3 text-center hover:cursor-pointer">
                          Edit
                        </div>
                      )}
                    </DialogTrigger>
                    <DialogContent className="rounded-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Edit Assignment
                        </DialogTitle>
                        <Separator />
                      </DialogHeader>
                      <form
                        id="editform"
                        onSubmit={editHandleSubmit((inputs) =>
                          updateAssignmentMutation.mutate({
                            inputs,
                            date,
                            assignment_id: assignment.id,
                            editReset,
                            setDate,
                            setIsEditDialogOpen,
                          }),
                        )}
                      >
                        <Label>Title</Label>
                        <Input {...editRegister("edittitle")} />
                        {editErrors.edittitle && (
                          <p className="text-red-500">
                            {editErrors.edittitle.message}
                          </p>
                        )}
                        <Label>Description</Label>
                        <Textarea
                          {...editRegister("editdescription", {
                            required: true,
                          })}
                        />
                        {editErrors.editdescription && (
                          <p className="text-red-500">{editErrors.editdescription.message}</p>
                        )}
                        <Label>Quiz Link</Label>
                        <Input {...editRegister("editquizlink")} />
                        {editErrors.editquizlink && (
                          <p className="text-red-500">{editErrors.editquizlink.message}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Controller
                            name="editparticipant"
                            control={editControl}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                onBlur={field.onBlur}
                                value={field.value}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Assignment For:" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Participants</SelectLabel>
                                    <SelectItem value="child">
                                      Children
                                    </SelectItem>
                                    <SelectItem value="parent">
                                      Parents
                                    </SelectItem>
                                    <SelectItem value="volunteer">
                                      Volunteers
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {editErrors.editparticipant && (
                            <p className="text-red-500">
                              {addErrors.participants.message}
                            </p>
                          )}

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant={"outline"}
                                className={cn(
                                  "w-[280px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon />
                                {date ? (
                                  format(date, "PPP")
                                ) : (
                                  <span>Pick due date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="z-50 w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(newDate) => {
                                  setDate(newDate);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </form>

                      <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                        <Button
                          onClick={() => setIsEditDialogOpen(false)}
                          variant="destructive"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          form="editform"
                          disabled={updateAssignmentMutation.isPending}
                        >
                          {updateAssignmentMutation.isPending
                            ? "Editting..."
                            : "Edit"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={(isOpen) => {
                      setIsDialogOpen(isOpen);
                    }}
                  >
                    <DialogTrigger className="w-full">
                      <div className="p-3 text-center text-red-500 hover:cursor-pointer">
                        Delete
                      </div>
                    </DialogTrigger>
                    <DialogContent className="rounded-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Delete Highlight
                        </DialogTitle>
                        <Separator />
                      </DialogHeader>
                      <DialogDescription>
                        Are you sure you want to delete highlight?
                      </DialogDescription>
                      <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                        <Button onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteAssignmentMutation.mutate(assignment.id)
                          }
                          disabled={deleteAssignmentMutation.isPending}
                        >
                          {deleteAssignmentMutation.isPending
                            ? "Deleting..."
                            : "Confirm"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </PopoverContent>
              </Popover>
              <p className="text-sm text-orange-600">
                For: {assignment.quiz_for}
              </p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="px-4">
            <p className="text-sm">{assignment.description}</p>
            <a
              className="underline hover:text-orange-600"
              href={`${assignment.quiz_link}`}
              target="_blank"
            >
              {assignment.quiz_link}
            </a>
          </div>
          <Separator className="my-3" />
          <div>
            <p className="text-sm text-orange-600">
              Due: <span>{assignment.due}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
