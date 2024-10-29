import {
  createAnnouncement,
  deleteAnnouncement,
  fetchClassAnnouncements,
  updateAnnouncement,
} from "@/api/ClassAnnouncementsServices";
import { useToast } from "@/shadcn/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function useClassAnnouncements(class_id) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading,isFetching } = useQuery({
    queryKey: ["classAnnouncements", class_id],
    queryFn: async () => fetchClassAnnouncements(class_id),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: (data, { reset, setFiles }) => {
      toast({
        title: "Success",
        description: "Announcement created.",
      });
      reset();
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["classAnnouncements", class_id],
      });
    },
  });
  const deleteAnnouncementMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: (data, { setFiles, setIsDialogOpen }) => {
      toast({
        title: "Success",
        description: "Announcement deleted.",
      });

      //   reset();
      setIsDialogOpen(false);
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["classAnnouncements", class_id],
      });
    },
  });
  const updateAnnouncementMutation = useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: (data, { resetEdit, setIsEditDialogOpen }) => {
      toast({
        title: "Success",
        description: "Announcement edited successfully.",
      });
      resetEdit();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["classAnnouncements", class_id],
      });
    },
  });
  return {
    data,
    isLoading,
    isFetching,
    updateAnnouncementMutation,
    deleteAnnouncementMutation,
    createAnnouncementMutation,
  };
}
