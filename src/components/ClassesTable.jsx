import Kebab from "../../src/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import { Link } from "react-router-dom";
import people from "@/assets/svg/people.svg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { useState } from "react";
import { Separator } from "@/shadcn/separator";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";
import { Button } from "@/shadcn/button";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import useCopyText from "@/hooks/useCopyText";

export default function ClassesTable({
  classes,
  updateClassMutation,
  deleteClassMutation,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen,setdeleteDialogOpen] = useState(false)

  const { register, handleSubmit, setValue: editSetValue } = useForm();
  const { copyText } = useCopyText();


  return (
    <div className="flex flex-col gap-3">
      {classes?.map((classdata, id) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-md p-4 shadow-md"
        >
          <Link
            to={`/volunteer-classes/${classdata.id}`}
            className=" flex-1 hover:cursor-pointer"
          >
            {classdata.class_name}
          </Link>
          <div className="flex min-w-60 justify-evenly gap-4">
            <div className="flex w-11 items-center justify-between">
              <p>{classdata.class_total_students}</p>
              <img src={people} alt="people icon" className="h-4 w-4" />
            </div>
            <p>
              {new Date(classdata.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <Popover>
              <PopoverTrigger>
                <img
                  src={Kebab}
                  alt="Icon"
                  className={clsx("h-6 w-6", {
                    invisible: classdata.status === "joined",
                  })}
                />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className={clsx("w-32 p-0", {
                  invisible: classdata.status === "joined",
                })}
              >
                <div
                  onClick={() => copyText(classdata.class_code)}
                  className={clsx("p-3 text-start hover:cursor-pointer", {
                    invisible: classdata.status === "joined",
                  })}
                >
                  Copy Code
                </div>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    open && editSetValue("classname", classdata.class_name);
                    !open && reset();
                  }}
                >
                  <DialogTrigger className="w-full">
                    <div className="p-3 text-start hover:cursor-pointer">
                      Edit
                    </div>
                  </DialogTrigger>
                  <DialogContent className="rounded-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        Edit Group Name
                      </DialogTitle>
                      <Separator />
                    </DialogHeader>
                    <div>
                      <form
                        onSubmit={handleSubmit((input) =>
                          updateClassMutation.mutate({
                            input,
                            class_id: classdata.id,
                            setIsDialogOpen,
                          }),
                        )}
                        id="myform"
                      >
                        <Label htmlFor="classname">Group Name</Label>
                        <Input
                          {...register("classname", {
                            required: "Class name is required",
                          })}
                          // defaultValue={classdata.class_name}
                          placeholder="Bible Study"
                          className="mt-1"
                          id="classname"
                        />
                      </form>
                    </div>
                    <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                      <Button
                        onClick={() => setIsDialogOpen(false)}
                        variant="destructive"
                      >
                        Cancel
                      </Button>
                      <Button
                        form="myform"
                        type="submit"
                        // onClick={handleSubmit(updateClass, classdata.id)}
                        disabled={updateClassMutation.isPending}
                      >
                        {updateClassMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={(isOpen) => {

                    setdeleteDialogOpen(isOpen);
                  }}
                >
                  <DialogTrigger>
                    <div
                      // onClick={() => deleteClassMutation.mutate(classdata.id)}
                      className="p-3 text-start text-red-500 hover:cursor-pointer"
                    >
                      Delete
                    </div>
                  </DialogTrigger>
                  <DialogContent className="rounded-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        Delete Group?
                      </DialogTitle>
                      <Separator />
                    </DialogHeader>
                    <DialogDescription>
                      Are you sure you want to delete this group?
                    </DialogDescription>
                    <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                      <Button
                        onClick={() => setdeleteDialogOpen(false)}
                        variant="default"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant={"destructive"}
                        onClick={() => {
                          // console.log("Files to delete:", values.files);
                          deleteClassMutation.mutate({class_id:classdata.id,setdeleteDialogOpen});
                        }}
                        disabled={deleteClassMutation.isPending}
                      >
                        {deleteClassMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
}
