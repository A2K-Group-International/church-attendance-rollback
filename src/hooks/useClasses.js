import {
  getClasses,
  addClass,
  deleteClass,
  joinClassAction,
  updateClass,
} from "@/api/classesServices";

import { useToast } from "@/shadcn/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useClasses(user_id) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["classes", user_id],
    queryFn: () => getClasses(user_id),
    enabled: !!user_id,
  });

  const addClassMutation = useMutation({
    mutationFn: addClass,
    onSuccess: (data, { setIsDialogOpen }) => {
      toast({
        title: "Success",
        description: "Class added.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", user_id] });
    },
  });

  const joinClassMutation = useMutation({
    mutationFn: joinClassAction,
    onSuccess: (data, { setIsJoinDialogOpen }) => {
      toast({
        title: "Success",
        description: "Request to join sent.",
      });
      setIsJoinDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", user_id] });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: updateClass,
    onSuccess: (data, { setIsDialogOpen }) => {
      toast({
        title: "Success",
        description: "Class Updated.",
      });
      setIsDialogOpen(false);
    },

    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", user_id] });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: (data, { setdeleteDialogOpen }) => {
      toast({
        title: "Success",
        description: "Class Deleted",
      });
      setdeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classes", user_id] });
    },
  });

  return {
    data,
    isLoading,
    error,
    deleteClassMutation,
    joinClassMutation,
    addClassMutation,
    updateClassMutation,
  };
}
