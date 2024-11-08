import React, { useState, useEffect } from "react"; // Import useEffect
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
} from "../../../shadcn/select"; // Import ShadCN select
import { useUser } from "@/context/UserContext";

const AnnouncementForm = ({
  newAnnouncement,
  setNewAnnouncement,
  handleSubmit,
  setUploadedImage,
  error,
}) => {
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const { userGroups } = useUser(); // Get user groups from context

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validImageTypes.includes(file.type)) {
        setUploadedImage(file); // Set the uploaded image
        setImagePreview(URL.createObjectURL(file)); // Set the image preview
      } else {
        alert("Please upload a valid image file (JPEG, PNG, GIF).");
      }
    }
  };

  // Log newAnnouncement whenever it updates
  useEffect(() => {
    console.log("Updated Announcement:", newAnnouncement);
  }, [newAnnouncement]);

  if (!userGroups || userGroups.length === 0) {
    return <p>Loading groups...</p>; // Display loading message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error message if it exists */}
      {error && <div className="text-red-500">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="post_header">Announcement Header</Label>
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
        <Label htmlFor="post_content">Announcement Content</Label>
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
        <Label htmlFor="image_upload">Upload Image</Label>
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
        <Label htmlFor="user_group">Select Ministry</Label>
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
              console.log("Selected Group ID:", selectedGroup.group_id);
              console.log("Selected Group Name:", selectedGroup.group_name);
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
        <Label htmlFor="announcement_privacy">Announcement Visibility</Label>
        <Select
          value={newAnnouncement.privacy}
          onValueChange={(value) =>
            setNewAnnouncement({ ...newAnnouncement, privacy: value })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Annoumncement Visibility" />
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
