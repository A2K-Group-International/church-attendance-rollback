import { Separator } from "@/shadcn/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Button } from "@/shadcn/button";
import contact from "@/assets/svg/contact.svg";
import { useEffect, useState } from "react";
import { useToast } from "@/shadcn/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { getInitial } from "@/lib/utils";
import useUserData from "@/api/useUserData";
import supabase from "@/api/supabase";
import { useParams } from "react-router-dom";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useCopyText from "@/hooks/useCopyText";
import useClassParticipants from "@/hooks/useClassParticipants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";

export default function VolunteerParticipants() {
  const { userData } = useUserData();
  const { id } = useParams();
  const { copyText } = useCopyText();
  const {
    isChildDialogOpen,
    isParentDialogOpen,
    isVolunteerDialogOpen,
    setIsVolunteerDialogOpen,
    setIsParentDialogOpen,
    setIsChildDialogOpen,
    data,
    isLoading,
    removeParticipantMutation,
    approveParticipantMutation,
    changeRoleMutation,
  } = useClassParticipants(id);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  console.log("data getting", data);
  console.log("user", userData);

  return (
    <div className="flex w-full flex-col items-center justify-center p-2">
      <div className="mx-4 w-full lg:w-3/5">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-semibold">Volunteers</h1>
          </div>
          <Separator className="my-3" />
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getInitial(
                      `${data?.owner.user_name} ${data?.owner.user_last_name}`,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>{`${data?.owner.user_name} ${data?.owner.user_last_name}`}</div>
              </div>
              <div>Owner</div>
            </div>
            <Separator className="my-3" />
            {data?.volunteers.map((volunteer, index) => {
              // Only render if user_type is "volunteer"
              if (volunteer.user_type === "volunteer") {
                return (
                  <div key={index}>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {getInitial(volunteer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>{volunteer.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(newRole) =>
                            changeRoleMutation.mutate({
                              participant_id: volunteer.id,
                              newRole,
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Change Role for user</SelectLabel> */}
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="volunteer">
                                Volunteer
                              </SelectItem>

                              <SelectItem value="parent">Parent</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {!volunteer.is_approved && (
                          <Button
                            onClick={() =>
                              approveParticipantMutation.mutate({
                                user_id: volunteer.user_id,
                                participant_id: volunteer.id,
                                columnName: "participant_volunteers",
                                classId: id,
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}
                        {userData?.user_role === "volunteer" && (
                          <Dialog
                            open={isVolunteerDialogOpen}
                            onOpenChange={setIsVolunteerDialogOpen}
                          >
                            <DialogTrigger>
                              <Button variant={"destructive"}>
                                {userData?.user_id === volunteer.user_id
                                  ? "Leave"
                                  : "Remove"}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-md">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">
                                  Remove {volunteer.name}?
                                </DialogTitle>
                                <Separator />
                              </DialogHeader>
                              <p>
                                Are you sure you want to remove {volunteer.name}
                                ?
                              </p>
                              <DialogFooter>
                                <Button
                                  onClick={() =>
                                    setIsVolunteerDialogOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  disabled={removeParticipantMutation.isPending}
                                  onClick={() =>
                                    removeParticipantMutation.mutate({
                                      user_id: volunteer.user_id,
                                      participant_id: volunteer.id,
                                      tablename:
                                        userData.user_role === "user"
                                          ? "parents"
                                          : "volunteers",
                                    })
                                  }
                                >
                                  {removeParticipantMutation.isPending
                                    ? "Removing"
                                    : "Remove"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    <Separator className="my-3" />
                  </div>
                );
              }

              // Return null if not volunteer
              return null;
            })}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Participants</h1>
            <p>{data?.parents.length + data?.children.length} Participants</p>
          </div>
          <Separator className="my-3" />
          <div>
            <h2 className="text-2xl font-semibold">Children</h2>
            <Separator className="my-3" />
            {data.children.map((child, index) => (
              <div className="" key={index}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitial(child.name)}</AvatarFallback>
                    </Avatar>
                    <div>{child.name}</div>
                  </div>
                  <div>
                    {userData?.user_role === "volunteer" && (
                      <div className="flex gap-2">
                        
                        <Select
                          onValueChange={(newRole) =>
                            changeRoleMutation.mutate({
                              participant_id: child.id,
                              newRole,
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Change Role for user</SelectLabel> */}
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="volunteer">
                                Volunteer
                              </SelectItem>

                              <SelectItem value="parent">Parent</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {!child.is_approved && (
                          <Button
                            onClick={() =>
                              approveParticipantMutation.mutate({
                                user_id: child.user_id,
                                participant_id: child.id,
                                columnName: "participant_volunteers",
                                classId: id,
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}
                        <Dialog
                          open={isChildDialogOpen}
                          onOpenChange={setIsChildDialogOpen}
                        >
                          <DialogTrigger>
                            <Button variant={"destructive"}>Remove</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-md">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                Remove {child.name}?
                              </DialogTitle>
                              <Separator />
                            </DialogHeader>
                            <p>Are you Sure you want to remove {child.name}?</p>
                            <DialogFooter>
                              <Button
                                onClick={() => setIsChildDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  removeParticipantMutation.mutate({
                                    participant_id: child.id,
                                    tablename: "children",
                                  })
                                }
                                disabled={removeParticipantMutation.isPending}
                              >
                                {removeParticipantMutation.isPending
                                  ? "Removing"
                                  : "Remove"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Parents</h2>
            <Separator className="my-3" />
            {data.parents.map((parent, index) => (
              <div className="" key={index}>
                <div className="flex justify-between ">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitial(parent.name)}</AvatarFallback>
                    </Avatar>
                    <div>{parent.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      onClick={() => copyText(parent.contact)}
                      className="hover:cursor-pointer hover:text-orange-400"
                    >
                      {parent.phone_number}
                    </p>
                    <img src={contact} alt="contact" className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {userData?.user_role === "volunteer" && (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(newRole) =>
                            changeRoleMutation.mutate({
                              participant_id: parent.id,
                              newRole,
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Change Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {/* <SelectLabel>Change Role for user</SelectLabel> */}
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="volunteer">
                                Volunteer
                              </SelectItem>

                              <SelectItem value="parent">Parent</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {!parent.is_approved && (
                          <Button
                            onClick={() =>
                              approveParticipantMutation.mutate({
                                user_id: parent.user_id,
                                participant_id: parent.id,
                                columnName: "participant_volunteers",
                                classId: id,
                              })
                            }
                          >
                            Approve
                          </Button>
                        )}
                        <Dialog
                          open={isParentDialogOpen}
                          onOpenChange={setIsParentDialogOpen}
                        >
                          <DialogTrigger>
                            <Button variant={"destructive"}>Remove</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-md">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                Remove {parent.name}?
                              </DialogTitle>
                              <Separator />
                            </DialogHeader>
                            <p>
                              Are you Sure you want to remove {parent.name}?
                            </p>
                            <DialogFooter>
                              <Button
                                onClick={() => setIsParentDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  removeParticipantMutation.mutate({
                                    participant_id: parent.id,
                                    tablename: "parents",
                                  })
                                }
                                disabled={removeParticipantMutation.isPending}
                              >
                                {removeParticipantMutation.isPending
                                  ? "Removing"
                                  : "Remove"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
