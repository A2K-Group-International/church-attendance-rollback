import React, { useState, useEffect } from "react";
import { Button } from "../../../shadcn/button";
import { DialogFooter } from "../../../shadcn/dialog";
import { Input } from "../../../shadcn/input";
import { Textarea } from "../../../shadcn/textarea";
import { Label } from "../../../shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { useUser } from "@/context/UserContext";
import * as Tooltip from "@radix-ui/react-tooltip"; // Import all tooltip components

const AnnouncementForm = ({
  newAnnouncement,
  setNewAnnouncement,
  handleSubmit,
  setUploadedImage,
  error,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const { userGroups } = useUser();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validImageTypes.includes(file.type)) {
        setUploadedImage(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        alert("Please upload a valid image file (JPEG, PNG, GIF).");
      }
    }
  };

  useEffect(() => {
    console.log("Updated Announcement:", newAnnouncement);
  }, [newAnnouncement]);

  if (!userGroups || userGroups.length === 0) {
    return <p>Loading groups...</p>;
  }

  // Icon component to use for the tooltip trigger
  const InfoIcon = () => (
    <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white">
      i
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-md bg-gray-50 p-4 shadow-lg"
    >
      {error && <div className="text-red-500">{error}</div>}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="post_header">Announcement Header</Label>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="ml-2">
                  <InfoIcon />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="right"
                align="center"
                className="rounded-md bg-gray-800 p-2 text-white"
              >
                Enter a brief title for the announcement.
                <Tooltip.Arrow className="fill-current text-gray-800" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <Input
          id="post_header"
          type="text"
          value={newAnnouncement.post_header}
          onChange={(e) =>
            setNewAnnouncement({
              ...newAnnouncement,
              post_header: e.target.value,
            })
          }
          required
          placeholder="Enter the announcement header..."
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="post_content">Announcement Content</Label>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="ml-2">
                  <InfoIcon />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="right"
                align="center"
                className="rounded-md bg-gray-800 p-2 text-white"
              >
                Provide the full details of your announcement here.
                <Tooltip.Arrow className="fill-current text-gray-800" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <Textarea
          id="post_content"
          value={newAnnouncement.post_content}
          onChange={(e) =>
            setNewAnnouncement({
              ...newAnnouncement,
              post_content: e.target.value,
            })
          }
          required
          placeholder="Enter your announcement here..."
          className="h-40 w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="image_upload">Upload Image</Label>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="ml-2">
                  <InfoIcon />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="right"
                align="center"
                className="rounded-md bg-gray-800 p-2 text-white"
              >
                Upload an optional image for the announcement (JPEG, PNG, GIF).
                <Tooltip.Arrow className="fill-current text-gray-800" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <Input
          type="file"
          id="image_upload"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleImageUpload}
          className="w-full"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-32 w-32 object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="user_group">Select Ministry</Label>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="ml-2">
                  <InfoIcon />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="right"
                align="center"
                className="rounded-md bg-gray-800 p-2 text-white"
              >
                Choose the ministry this announcement is for.
                <Tooltip.Arrow className="fill-current text-gray-800" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <Select
          value={newAnnouncement.groupId}
          onValueChange={(value) => {
            const selectedGroup = userGroups.find(
              (group) => group.group_id === value,
            );
            if (selectedGroup) {
              setNewAnnouncement({
                ...newAnnouncement,
                groupId: selectedGroup.group_id,
                groupName: selectedGroup.group_name,
              });
            }
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a ministry" />
          </SelectTrigger>
          <SelectContent>
            {userGroups.map((group) => (
              <SelectItem key={group.group_id} value={group.group_id}>
                {group.group_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="announcement_privacy">Announcement Visibility</Label>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="ml-2">
                  <InfoIcon />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="right"
                align="center"
                className="rounded-md bg-gray-800 p-2 text-white"
              >
                Set who can view this announcement (public for parishioners or
                private for private ministry matters).
                <Tooltip.Arrow className="fill-current text-gray-800" />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <Select
          value={newAnnouncement.privacy}
          onValueChange={(value) =>
            setNewAnnouncement({ ...newAnnouncement, privacy: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Announcement Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private/Ministry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit">Post Announcement</Button>
      </DialogFooter>
    </form>
  );
};

export default AnnouncementForm;
