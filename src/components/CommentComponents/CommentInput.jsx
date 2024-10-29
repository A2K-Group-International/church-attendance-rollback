import useUserData from "@/api/useUserData";
import useComment from "@/hooks/useComment";
import { Button } from "@/shadcn/button";
import { Textarea } from "@/shadcn/textarea";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function CommentInput({
  announcement_id,
  HandleAddComment,
  columnName,
}) {
  const { register, handleSubmit, reset, error } = useForm();
  const { userData } = useUserData();
  const [isCommenting, setIsCommenting] = useState(false);

  return (
    <div className="flex-grow">
      <form
        onSubmit={handleSubmit((data) =>
          HandleAddComment(data, userData.user_id, announcement_id, columnName,setIsCommenting,reset),
        )}
        id={`comment${announcement_id}`}
        className="flex-1"
      >
        <Textarea
          {...register(`comment${announcement_id}`)}
          onFocus={() => setIsCommenting(true)}
          name={`comment${announcement_id}`}
          placeholder="Write Your Comment Here"
        />
      </form>

      {isCommenting && (
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            onClick={() => setIsCommenting(false)}
            variant={"ghost"}
          >
            Cancel
          </Button>
          <Button
            // onClick={()=>{console.log(announcement_id)}}
            type="submit"
            form={`comment${announcement_id}`}
            className="bg-orange-400 hover:bg-orange-500"
          >
            Comment
          </Button>
        </div>
      )}
    </div>
  );
}
