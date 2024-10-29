import { Button } from '@/shadcn/button'
import React from 'react'


export default function SetShowReplyButton({showReply, setShowReply}) {
  return (
    <Button
    type="button"
    onClick={() => setShowReply((prevState) => !prevState)}
    className=" px-1 rounded-2xl w-fit hover:bg-orange-300 mb-1"
    variant={"ghost"}
  >
    {showReply ? "Hide Replies" : "Show Replies"}
  </Button>
  )
}
