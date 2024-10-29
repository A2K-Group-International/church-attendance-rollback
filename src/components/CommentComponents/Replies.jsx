import useUserData from "@/api/useUserData";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import CommentDate from "./CommentDate";
import kebab from "@/assets/svg/threeDots.svg";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/shadcn/dialog";
import ReplyInput from "./ReplyInput";
import { getInitial } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "@/shadcn/button";
import EditReplyForm from "./EditReplyForm";
import TriggerLikeIcon from "./TriggerLikeIcon";
import TriggerDislikeIcon from "./TriggerDislikeIcon";

export default function Replies({
  courseId,
  reply,
  showReply,
  commentId,
  handleUpdateReply,
  handleDeleteReply,
  handleAddReply
}) {
  const { userData } = useUserData();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditting, setEditting] = useState(false);

  return (
    <div
      key={reply.comment_id}
      className={clsx(
        "mb-2 flex gap-2 overflow-hidden text-xs transition-all duration-500",
        {
          "h-fit": showReply === true,
          "h-0": showReply === false,
        },
      )}
    >
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={reply?.user_list?.user_image ?? ""}
            alt="profile picture"
          />
          <AvatarFallback className="bg-green-600">
            {getInitial(reply?.user_list?.user_name)}
          </AvatarFallback>
        </Avatar>
      </div>

      {isEditting ? (
        <EditReplyForm
          comment_id={reply.comment_id}
          setEditting={setEditting}
          InputDefaultValue={reply.comment_content}
          handleUpdateReply={handleUpdateReply}
        />
      ) : (
        <div className="flex-grow">
          <div className="flex flex-grow justify-between">
            <div className="flex flex-col">
              <p>{reply?.user_list?.user_name}</p>
              <div className="flex gap-1">
                <CommentDate
                  date={reply.created_at}
                  isEdited={reply.edited}
                  InputDefaultValue={reply.comment_content}
                />
              </div>
            </div>
            <div>
              {userData?.user_id === reply?.user_list?.user_id && (
                <Popover>
                  <PopoverTrigger>
                    <img src={kebab} alt="kebab icon" />
                  </PopoverTrigger>
                  <PopoverContent className="flex w-28 flex-col overflow-hidden p-0">
                    <Button
                      onClick={() => setEditting(true)}
                      className="w-full rounded-none"
                      variant={"outline"}
                    >
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full rounded-none"
                          variant={"destructive"}
                        >
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Delete Comment</DialogTitle>
                          <DialogDescription>
                            Delete Your Comment Permanently
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="default">
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={() =>
                                handleDeleteReply(reply.comment_id)
                              }
                              variant={"destructive"}
                              type="submit"
                            >
                              Delete
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm">{reply.comment_content}</p>
            <div className="my-2 flex items-center">
              <div className="flex rounded-full p-2 hover:bg-slate-200">
                <TriggerLikeIcon
                  comment_id={reply.comment_id}
                  user_id={userData?.user_id}
                />
              </div>
              <div className="ml-2 flex rounded-full p-2 hover:cursor-pointer hover:bg-slate-200">
                <TriggerDislikeIcon
                    comment_id={reply.comment_id}
                    user_id={userData?.user_id}
                />
              </div>

              <Button
                onClick={() => setIsReplying(true)}
                variant={"ghost"}
                className="ml-2 rounded-2xl"
              >
                reply
              </Button>
            </div>
            <ReplyInput
              replyTo={reply?.user_list?.user_name}
              setEditting={setEditting}
              comment_id={commentId}
              isReplying={isReplying}
              handleAddReply={handleAddReply}
              setIsReplying={setIsReplying}
            />
          </div>
        </div>
      )}
    </div>
  );
}
