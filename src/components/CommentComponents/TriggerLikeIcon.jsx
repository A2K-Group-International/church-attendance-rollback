import React from "react";

import solidlike from "@/assets/svg/thumbs-up-color.svg";
import like from "@/assets/svg/thumbs-up-no-color.svg";
import { getCommentStatus } from "@/api/commentsService";
import { useQuery } from "@tanstack/react-query";
import useLikeDislike from "@/hooks/useLikeDislike";
export default function TriggerLikeIcon({
  // liked,
  comment_id,
  user_id,
  // handleLike,
  
}) {
  const {data, handleLike,likeCount} = useLikeDislike(comment_id, user_id)

  // console.log("my like count",likeCount)

  return (
    <div className=" flex justify-center items-center">
      {data?.isLiked ? (
        <img
          onClick={() => handleLike(comment_id, user_id)}
          className="w-5 text-xl hover:cursor-pointer"
          src={solidlike}
          alt="solid like icon"
        />
      ) : (
        <img
          onClick={() => handleLike(comment_id, user_id)}
          className="w-5 text-xl hover:cursor-pointer"
          src={like}
          alt="like icon"
        />  
      )}
             <p className=" text-xs">{likeCount}</p>
    </div>
  );
}
