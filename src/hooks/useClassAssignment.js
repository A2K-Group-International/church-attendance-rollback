import {
  addAssignment,
  deleteAssignment,
  editAssignment,
  fetchAssignments,
} from "@/api/ClassAssignmentServices";
import { useToast } from "@/shadcn/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function useClassAssignment(class_id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    data: assignments,
    isLoading,
    error,
  } = useQuery({
    queryFn: ()=>fetchAssignments(class_id),
    queryKey: ["assignments",class_id],
  });

  const addAssignmentMutation = useMutation({
    mutationFn: addAssignment,
    onSuccess: (data,{reset,setDate}) => {
      toast({
        title: "Success",
        description: "Assignment added successfully.",
      });
      reset();
      setDate("");
    },
    onError: (error) => {
      // console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments",class_id] });
    },
  });
  const updateAssignmentMutation = useMutation({
    mutationFn: editAssignment,
    onSuccess: (data,{editReset,setDate,setIsEditDialogOpen}) => {
      toast({
        title: "Success",
        description: "Assignment edited successfully.",
      });
      editReset();
      setDate("");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      // console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments",class_id] });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments",class_id] });
    },
  });


  return {
    error,
    assignments,
    isLoading,
    deleteAssignmentMutation,
    updateAssignmentMutation,
    addAssignmentMutation,
  };
}
