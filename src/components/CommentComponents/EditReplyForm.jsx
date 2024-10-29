import useComment from "@/hooks/useComment";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function EditReplyForm({
  comment_id,
  setEditting,
  InputDefaultValue,
  handleUpdateReply
}) {
  const { register, reset, handleSubmit, setValue } = useForm();
  // const { handleUpdateComment } = useComment(announcement_id);

  useEffect(() => {
    if (InputDefaultValue) {
      setValue("comment", InputDefaultValue);
    }
  }, []);
return (
    <form
      onSubmit={handleSubmit((inputs) =>
        handleUpdateReply(inputs, comment_id,setEditting)
      )}
      className="mb-2 flex p-1 w-full flex-col gap-2"
    >
      <Input
        {...register("comment", { required: true })}
        name="comment"
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant={"outline"}
          onClick={() => setEditting(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-400 hover:bg-blue-500">
          Save
        </Button>
      </div>
    </form>
  );
}
