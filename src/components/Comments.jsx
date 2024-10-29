import useUserData from "@/api/useUserData";
import { useToast } from "@/shadcn/use-toast";
import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Textarea } from "@/shadcn/textarea";
import { Button } from "@/shadcn/button";
import { Separator } from "@/shadcn/separator";
import { useState } from "react";
import CommentInput from "./CommentComponents/CommentInput";
import useComment from "@/hooks/useComment";
import CommentDetails from "./CommentComponents/CommentDetails";

export default function Comments({ announcement_id,columnName }) {

  const { userData } = useUserData();
  const Initial = getInitial(userData?.user_name);
  const { HandleAddComment,commentData, isError, isLoading } = useComment(announcement_id,null,columnName);

  // console.log("data each announcement",commentData, columnName)

  return (
    <div className="p-1">
      <h1 className="text-md mb-2 font-bold">
        {" "}
        {commentData?.length} Comments
      </h1>
      <div className="flex w-full items-start justify-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={""}
            alt="@shadcn"
          />
          <AvatarFallback className=" bg-green-600">
            {Initial}
          </AvatarFallback>
        </Avatar>
        <CommentInput HandleAddComment={HandleAddComment} announcement_id={announcement_id} columnName={columnName}/>
      </div>
      <Separator className="my-3" />
      {isLoading ? (
        <p>loading...</p>
      ) : (
        commentData?.map((comment, index) => (
          // <p>{comment.comment_content}</p>
          <CommentDetails
            key={index}
            columnName={columnName}
            comment={comment}
            announcement_id={announcement_id}
          />
        ))
      )}
    </div>
  );
}
