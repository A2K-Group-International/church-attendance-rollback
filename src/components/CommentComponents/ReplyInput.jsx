import { useEffect, useRef, useState } from "react";

import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import clsx from "clsx";

import { useToast } from "@/hooks/use-toast";
import useUserData from "@/api/useUserData";
import { Input } from "@/shadcn/input";
import { Button } from "@/shadcn/button";
import { useForm } from "react-hook-form";
import useReply from "@/hooks/useReply";

export default function ReplyInput({
  announcement_id,
  comment_id,
  isReplying,
  setIsReplying,
  setEditting,
  replyTo,
  handleAddReply
}) {
  const { userData } = useUserData();
  const { register, reset, handleSubmit, setValue } = useForm();
  // const { handleAddReply } = useReply(comment_id,null);

  useEffect(() => {
    if (replyTo) {
      setValue("reply", `@${replyTo} `);
    }
  }, []);


  return (
    <div className="mr-2 flex flex-col gap-2">
      {isReplying && (
        <form
          onSubmit={handleSubmit((inputs) =>
            handleAddReply(
              inputs,
              userData.user_id,
              comment_id,
              setEditting,
              reset
            ),
          )}
          className="flex"
        >
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  className=""
                  src={userData?.user_image ?? ""}
                  alt="@shadcn"
                />
                <AvatarFallback className="bg-green-600">
                  {getInitial(userData?.user_name)}
                </AvatarFallback>
              </Avatar>
              <Input
                {...register("reply", { required: true })}
                name="reply"
                placeholder="type your reply here"
              ></Input>
            </div>

            <div className="flex justify-end">
            <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  variant={"outline"}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-400 hover:bg-orange-500"
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
