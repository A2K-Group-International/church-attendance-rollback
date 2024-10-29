import useUserData from "@/api/useUserData";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Button } from "@/shadcn/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { useState } from "react";
import { getInitial } from "@/lib/utils";
import CommentDate from "./CommentDate";
import ReplyInput from "./ReplyInput";
import { DialogClose, DialogDescription } from "../shadcn/dialog";
import kebab from "@/assets/svg/threeDots.svg";
import EditCommentForm from "./EditCommentForm";
import useComment from "@/hooks/useComment";
import SetShowReplyButton from "./SetShowReplyButton";
import Replies from "./Replies";
import useReply from "@/hooks/useReply";
import TriggerLikeIcon from "./TriggerLikeIcon";
import TriggerDislikeIcon from "./TriggerDislikeIcon";

export default function CommentDetails({ announcement_id, comment, columnName }) {
  const { userData } = useUserData();
  const [isReplying, setIsReplying] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [isEditting, setEditting] = useState(false);
  const { handleDeleteComment,handleUpdateComment} = useComment(announcement_id,comment.comment_id,columnName);
  const { replyData, isLoading, isError, handleUpdateReply ,handleDeleteReply, handleAddReply } = useReply(
    comment.comment_id,
    showReply,
    announcement_id
  );

  return (
    <div className="flex gap-2">
      <div className="flex">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.user_list.user_image ?? ""}
            alt="profile picture"
          />
          <AvatarFallback className="h-8 w-8 rounded-full bg-green-600 p-2">
            {getInitial(comment.user_list.user_name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        {!isEditting ? (
          <div className="tems-center flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p>{comment.user_list.user_name}</p>
                <CommentDate
                  date={comment.created_at}
                  isEdited={comment.edited}
                />
              </div>
              <div>
                {userData?.user_id === comment.user_list.user_id && (
                  <Popover>
                    <PopoverTrigger>
                      {/* <GoKebabHorizontal className="w-5 h-5 mr-2" /> */}
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
                              <Button
                                // onClick={}
                                type="button"
                                variant="default"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                onClick={() =>
                                  handleDeleteComment(comment.comment_id)
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
            <div className="">{comment.comment_content}</div>
            <div className="flex items-center">
            <div className=" flex p-2 rounded-full hover:bg-slate-200">
              <TriggerLikeIcon
                comment_id={comment.comment_id}
                user_id={userData?.user_id}
              />
          
            </div>
            <div className=" flex p-2 rounded-full hover:bg-slate-200 hover:cursor-pointer">
              <TriggerDislikeIcon
                comment_id={comment.comment_id}
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
          </div>
        ) : (
          <EditCommentForm
            comment_id={comment.comment_id}
            setEditting={setEditting}
            InputDefaultValue={comment.comment_content}
            handleUpdateComment={handleUpdateComment}
          />
        )}
        <ReplyInput
          setEditting={setEditting}
          announcement_id={announcement_id}
          comment_id={comment.comment_id}
          isReplying={isReplying}
          setIsReplying={setIsReplying}
          handleAddReply={handleAddReply}
          // replyTo={comment.user_list.user_name}
        />
        {comment?.reply_count > 0 && (
          <SetShowReplyButton
            setShowReply={setShowReply}
            showReply={showReply}
          />
        )}
        <div className="flex flex-col">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            replyData?.map((reply, index) => (
              <Replies
                key={index}
                commentId={comment.comment_id}
                announcement_id={announcement_id}
                showReply={showReply}
                isEditting={isEditting}
                setEditting={setEditting}
                reply={reply}
                handleDeleteReply={handleDeleteReply}
                handleUpdateReply={handleUpdateReply}
                handleAddReply={handleAddReply}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
