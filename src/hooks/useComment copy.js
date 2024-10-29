import {
  addComment,
  deleteComment,
  dislikeComment,
  fetchComments,
  likeComment,
  updateComment,
} from "@/api/commentsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";

export default function useComment(announcement_id, comment_id, columnName) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (data,{reset,setIsCommenting}) => {
      toast({
        title: "Success",
        description: "Comment Added.",
      });
      reset()
      setIsCommenting(false)
      
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      console.log("before invalidating", announcement_id);
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });
  const {
    data: commentData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["comments", announcement_id],
    queryFn: () => fetchComments(announcement_id, columnName),
    enabled: !!announcement_id && !!columnName,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Deleted.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      console.log("invalidating", announcement_id, comment_id),
        queryClient.invalidateQueries({
          queryKey: ["comments", announcement_id],
        });
      queryClient.invalidateQueries({
        queryKey: ["replies", comment_id],
      });
    },
  });
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Updated.",
      });

      //   reset()
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      console.log("before invalidating", announcement_id);
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });

  const HandleAddComment = (data, user_id, post_id, columnName,setIsCommenting,reset) => {
    addCommentMutation.mutate({
      comment: data[`comment${post_id}`],
      user_id,
      announcement_id,
      columnName,
      setIsCommenting,
      reset
    });
  };

  const handleDeleteComment = (comment_id) => {
    console.log("my commentid", comment_id);
    deleteCommentMutation.mutate(comment_id);
  };

  const handleUpdateComment = (inputs, comment_id, setEditting) => {
    console.log("my inputs", inputs);
    updateCommentMutation.mutate(
      { comment: inputs.comment, comment_id },
      {
        onSuccess: () => {
          setEditting(false);
        },
      },
    );
  };

  return {
  handleDeleteComment,
    handleUpdateComment,
    HandleAddComment,
    isError,
    isLoading,
    commentData,
  };
}
