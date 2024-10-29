import React from "react";
import soliddislike from "@/assets/svg/thumbs-down-color.svg";
import dislike from "@/assets/svg/thumbs-down-no-color.svg";
import useLikeDislike from "@/hooks/useLikeDislike";

export default function TriggerDislikeIcon({
  comment_id,
  user_id,
  // handleDislike,
}) {
  const {data, handleDislike,dislikeCount} = useLikeDislike(comment_id, user_id)

  // console.log("my dislike count",dislikeCount)
  return (
    <div className=" flex justify-center items-center">
      {data?.isDisliked ? (
        <img
          onClick={() => handleDislike(comment_id, user_id)}
          className="w-5 text-xl hover:cursor-pointer"
          src={soliddislike}  
          alt="solid dislike icon"
        />
      ) : (
        <img
          onClick={() => handleDislike(comment_id, user_id)}
          className="w-5 text-xl hover:cursor-pointer"
          src={dislike}
          alt="dislike icon"
        />
      )}
       <p className=" text-xs">{dislikeCount}</p>
    </div>
  );
}
