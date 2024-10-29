import {
    dislikeComment,
    getCommentStatus,
    getDislikeCount,
    getLikeCount,
    likeComment,
  } from "@/api/commentsService";
  import { useToast } from "@/shadcn/use-toast";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  
  export default function useLikeDislike(comment_id, user_id) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    const addLikeMutation = useMutation({
      mutationFn: likeComment,
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Comment Liked.",
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
        queryClient.invalidateQueries({
          queryKey: ["likeCount", comment_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["dislikeCount", comment_id], 
        });
        queryClient.invalidateQueries({
          queryKey: ["commentStatus", comment_id, user_id], 
        });
      },
    });
  
    const addDislikeMutation = useMutation({
      mutationFn: dislikeComment,
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Comment Disliked.",
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
        queryClient.invalidateQueries({
          queryKey: ["dislikeCount", comment_id], 
        });
        queryClient.invalidateQueries({
          queryKey: ["likeCount", comment_id], 
        });
        queryClient.invalidateQueries({
          queryKey: ["commentStatus", comment_id, user_id], 
        });
      },
    });
  
    const { data } = useQuery({
      queryKey: ["commentStatus", comment_id, user_id],
      queryFn: () => getCommentStatus({ comment_id, user_id }),
      enabled: !!user_id && !!comment_id,
    });
  
    const { data: likeCount } = useQuery({
      queryKey: ["likeCount", comment_id], 
      queryFn: () => getLikeCount({ comment_id }),
      enabled: !!comment_id,
    });
  
    const { data: dislikeCount } = useQuery({
      queryKey: ["dislikeCount", comment_id],
      queryFn: () => getDislikeCount({ comment_id }),
      enabled: !!comment_id,
    });
  
    const handleLike = (comment_id, user_id) => {
      console.log("handle", comment_id, user_id);
      addLikeMutation.mutate({ comment_id, user_id });
    };
  
    const handleDislike = (comment_id, user_id) => {
      console.log("handle", comment_id, user_id);
      addDislikeMutation.mutate({ comment_id, user_id });
    };
  
    return { handleLike, handleDislike, data, dislikeCount, likeCount };
  }
  