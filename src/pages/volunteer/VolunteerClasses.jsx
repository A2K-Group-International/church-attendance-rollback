import { useEffect, useState } from "react";
import VolunteerSidebar from "@/components/volunteer/VolunteerSidebar";
import { Button } from "@/shadcn/button";
import { useForm } from "react-hook-form";
import Title from "@/components/Title";
import ClassesTable from "@/components/ClassesTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { Separator } from "@/shadcn/separator";
import { Label } from "@/shadcn/label";
import { Input } from "@/shadcn/input";
import useUserData from "@/api/useUserData";
import useClasses from "@/hooks/useClasses";
import { zodResolver } from "@hookform/resolvers/zod";
import { addClassSchema, joinClassSchema } from "@/lib/zodSchema/classSchema";

export default function VolunteerClasses() {
  const { userData } = useUserData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addClassSchema),
  });

  const {
    register: registerJoinClass,
    handleSubmit: handleJoinClass,
    reset: resetJoinClass,
    setValue: setJoinValue,
    formState: { errors: joinErrors },
  } = useForm({
    resolver: zodResolver(joinClassSchema),
  });

  const {
    data,
    isLoading,
    deleteClassMutation,
    joinClassMutation,
    addClassMutation,
    updateClassMutation,
  } = useClasses(userData?.user_id);


  return (
    <div className="h-screen overflow-y-scroll p-8">
      <div className="mb-4 flex justify-between">
        <Title>Your Groups</Title>
        <div className="flex gap-2">
          {/* Join Group Dialog */}
          <Dialog
            open={isJoinDialogOpen}
            onOpenChange={(open) => {
              setIsJoinDialogOpen(open);
              setValue("classCode", "");
              if (!open) resetJoinClass();
            }}
          >
            <DialogTrigger>
              <Button onClick={() => setIsJoinDialogOpen(true)}>
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Join Group</DialogTitle>
                <Separator />
              </DialogHeader>
              <div>
                <form
                  id="joinForm"
                  onSubmit={handleJoinClass((input) => {
                    console.log("Form Input:", input); 
                    joinClassMutation.mutate({
                      input,
                      user_name: `${userData?.user_name} ${userData?.user_last_name}`,
                      contact: userData?.user_contact,
                      user_id: userData?.user_id,
                      user_role: userData?.user_role,
                      setIsJoinDialogOpen,
                    });
                  })}
                >
                  <Label htmlFor="classCode">Group Code</Label>
                  <Input
                    {...registerJoinClass("classCode", {
                      required: "Class code is required",
                    })}
                    placeholder="Place your group code here"
                    className="mt-1"
                    id="classCode"
                  />
                  {joinErrors.classCode && (
                    <p className="text-red-500">
                      {joinErrors.classCode.message}
                    </p>
                  )}
                  
                </form>
              </div>
              <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                <Button
                  onClick={() => setIsJoinDialogOpen(false)}
                  variant="destructive"
                >
                  Cancel
                </Button>
                <Button
                  form="joinForm"
                  type="submit"
                  disabled={joinClassMutation.isPending}
                >
                  {joinClassMutation.isPending ? "Joining..." : "Join Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {userData.user_role === "volunteer" && <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              setValue("classname", "");
              if (!open) reset();
            }}
          >
            <DialogTrigger>
              <Button onClick={() => setIsDialogOpen(true)}>New Group</Button>
            </DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Group</DialogTitle>
                <Separator />
              </DialogHeader>
              <div>
                <form
                  id="addClassForm"
                  onSubmit={handleSubmit((input) => {
                    console.log("Form Input:", input); 
                    addClassMutation.mutate({
                      input,
                      user_id: userData?.user_id,
                      setIsDialogOpen,
                    });
                  })}
                >
                  <Label htmlFor="classname">Group Name</Label>
                  <Input
                    {...register("classname")}
                    placeholder="Bible Study"
                    className="mt-1"
                  />
                  {errors.classname && (
                    <p className="text-red-500">{errors.classname.message}</p>
                  )}
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
                  type="submit"
                  form="addClassForm"
                  disabled={addClassMutation.isPending}
                >
                  {addClassMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}
        </div>
      </div>

      {isLoading ? (
        <p>loading...</p>
      ) : (
        <ClassesTable
          classes={data}
          updateClassMutation={updateClassMutation}
          deleteClassMutation={deleteClassMutation}
        />
      )}
    </div>
  );
}
