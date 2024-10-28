import React from "react";
import { Button } from "../../../shadcn/button";
import { DialogFooter, DialogClose } from "../../../shadcn/dialog";
import { Input } from "../../../shadcn/input";
import { Textarea } from "../../../shadcn/textarea";
import { Label } from "../../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select"; // Import ShadCN select

const AnnouncementEdit = ({ announcement, setAnnouncement, handleEdit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    handleEdit(announcement);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="post_header">Announcement Header</Label>
        <Input
          id="post_header"
          type="text"
          value={announcement.post_header}
          onChange={(e) =>
            setAnnouncement({
              ...announcement,
              post_header: e.target.value,
            })
          }
          required
          placeholder="Enter the announcement header..."
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post_content">Announcement Content</Label>
        <Textarea
          id="post_content"
          value={announcement.post_content}
          onChange={(e) =>
            setAnnouncement({
              ...announcement,
              post_content: e.target.value,
            })
          }
          required
          placeholder="Enter your announcement here..."
          className="h-40 w-full"
        />
      </div>

      {/* Privacy option using ShadCN Select */}
      <div className="space-y-2">
        <Label htmlFor="announcement_privacy">Announcement Visibility</Label>
        <Select
          value={announcement.privacy}
          onValueChange={(value) =>
            setAnnouncement({ ...announcement, privacy: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Group</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="submit">Save Changes</Button>
        </DialogClose>
      </DialogFooter>
    </form>
  );
};

export default AnnouncementEdit;
