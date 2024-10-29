import {
  approveParticipants,
  changeParticipantRole,
  fetchAllParticipants,
  removeParticipants,
} from "@/api/ClassParticipantsServices";
import { useToast } from "@/shadcn/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function useClassParticipants(class_id) {
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false);
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["participants", class_id],
    queryFn: ()=> fetchAllParticipants(class_id),
  });

  const removeParticipantMutation = useMutation({
    mutationFn: removeParticipants,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User Removed",
      });
      // reset();
      setIsChildDialogOpen(false);
      setIsParentDialogOpen(false);
      setIsVolunteerDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });

  const approveParticipantMutation = useMutation({
    mutationFn: approveParticipants,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Participant Approved",
      });
      setIsChildDialogOpen(false);
      setIsParentDialogOpen(false);
      setIsVolunteerDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
  
  const changeRoleMutation = useMutation({
    mutationFn: changeParticipantRole,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Participant role changed",
      });
      // setIsChildDialogOpen(false);
      // setIsParentDialogOpen(false);
      // setIsVolunteerDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
  

  return {
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
    changeRoleMutation
  };
}
