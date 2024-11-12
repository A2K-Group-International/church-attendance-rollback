import { useState, useEffect, useCallback } from "react";
import supabase from "../../api/supabase";
import VolunteerSidebar from "../../components/volunteer/VolunteerSidebar";

import Spinner from "../../components/Spinner";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import useAnnouncements from "../../api/useAnnouncements";
import AnnouncementCard from "../../components/volunteer/post/AnnouncementCard";
import AnnouncementForm from "../../components/volunteer/post/AnnouncementForm";
import AnnouncementEdit from "../../components/volunteer/post/AnnouncementEdit"; // Import the edit component
import { useUser } from "@/context/UserContext";
// import GroupSelect from "@/components/volunteer/post/GroupSelect";
import VolunteerGroups from "@/components/volunteer/post/VolunteerGroups";
import GroupSelectionDialog from "@/components/volunteer/post/GroupSelectionDialog";

export default function VolunteerAnnouncements() {
  const [groupId, setGroupId] = useState(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // New state for edit dialog
  const [newAnnouncement, setNewAnnouncement] = useState({
    post_content: "",
    post_header: "",
  });

  const [announcementToEdit, setAnnouncementToEdit] = useState(null); // State for the announcement being edited
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // For pagination
  const [uploadedImage, setUploadedImage] = useState(null); // State for the uploaded image

  const { userData, userGroups } = useUser();
  const {
    announcements,
    loading: announcementsLoading,
    error: announcementsError,
    fetchAnnouncements,
  } = useAnnouncements(groupId, null); // Fetch all announcements

  const handleReaction = async (postId, reaction) => {
    const userId = userData.user_id;
    try {
      // Check if the user has already reacted to the post
      const { data, error } = await supabase
        .from("reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId); // Assuming you have userId available

      if (error) throw error;

      if (data.length > 0) {
        // User has already reacted
        const existingReaction = data[0];

        if (existingReaction.reaction_type === reaction) {
          // Remove reaction if it's the same as the clicked one
          await supabase
            .from("reactions")
            .delete()
            .eq("reaction_id", existingReaction.reaction_id);
        } else {
          // Update reaction if it's different
          await supabase
            .from("reactions")
            .update({ reaction_type: reaction })
            .eq("reaction_id", existingReaction.reaction_id);
        }
      } else {
        // User has not reacted yet, insert a new reaction
        await supabase
          .from("reactions")
          .insert([
            { post_id: postId, user_id: userId, reaction_type: reaction },
          ]);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  // Helper function to retrieve public URL with retries
  const getPublicUrlWithRetry = async (
    bucket,
    filePath,
    retries = 3,
    delayMs = 1000,
  ) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const { data, error } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (error) {
        console.error(
          `Attempt ${attempt}: URL Retrieval Error:`,
          error.message,
        );
      } else if (data && data.publicUrl) {
        console.log(`Attempt ${attempt}: Public URL retrieved successfully.`);
        return data.publicUrl;
      } else {
        console.warn(`Attempt ${attempt}: publicUrl is undefined.`);
      }

      // Wait for the specified delay before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(
      "Failed to retrieve the public URL after multiple attempts.",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (
      !newAnnouncement.post_header ||
      !newAnnouncement.post_content ||
      !newAnnouncement.groupId ||
      !newAnnouncement.privacy
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Get group_id and group_name from newAnnouncement
      const groupId = newAnnouncement.groupId; // Retrieve groupId from newAnnouncement
      const groupName = newAnnouncement.groupName; // Retrieve groupName from newAnnouncement
      let imageUrl = null; // Initialize imageUrl to null

      if (uploadedImage) {
        const fileExtension = uploadedImage.name.split(".").pop();
        const date = new Date();
        const dateString = date.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
        const sanitizedHeader = newAnnouncement.post_header.replace(
          /[^a-zA-Z0-9]/g,
          "_",
        );
        const fileName = `${sanitizedHeader}_${dateString}.${fileExtension}`;
        const folder = "Images";

        // **Important:** Do NOT encode the path components
        const filePath = `${groupName}/${folder}/${fileName}`; // No encoding

        const BUCKET_NAME = "Uploaded files"; // Ensure this matches your bucket name

        // Upload the image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, uploadedImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload Error:", uploadError.message);
          throw new Error(`Upload Error: ${uploadError.message}`);
        }

        console.log(`Image uploaded successfully to: ${filePath}`);

        // Retrieve the public URL with retry mechanism
        imageUrl = await getPublicUrlWithRetry(BUCKET_NAME, filePath, 5, 1000);
        console.log(`Public URL retrieved: ${imageUrl}`);
      }

      // Insert the announcement into the database
      const { error: insertError } = await supabase.from("post_data").insert([
        {
          post_content: newAnnouncement.post_content,
          post_header: newAnnouncement.post_header,
          created_at: new Date().toISOString(),
          post_user_id: userData.user_id,
          post_group_id: groupId, // Use groupId from newAnnouncement
          group_name: groupName, // Use groupName from newAnnouncement
          user_name: `${userData.user_name} ${userData.user_last_name}`,
          uploaded_image: imageUrl, // Use the publicUrl variable here
          public: newAnnouncement.privacy === "public", // Use the privacy field to set the "public" column
        },
      ]);

      if (insertError) {
        console.error("Insert Error:", insertError.message);
        throw insertError;
      }

      console.log("Announcement inserted successfully.");

      // Fetch announcements to refresh the list
      fetchAnnouncements();

      // Reset the dialog and form state
      setIsDialogOpen(false);
      setNewAnnouncement({
        post_content: "",
        post_header: "",
        groupId: null,
        groupName: "",
      }); // Reset state including group info
      setUploadedImage(null); // Reset the uploaded image
    } catch (err) {
      setError("Error creating announcement. Please try again."); // Set error message
      console.error("Error creating announcement:", err);
    }
  };

  // New function to handle editing announcements
  const handleEdit = async (announcement) => {
    try {
      const { error } = await supabase
        .from("post_data")
        .update({
          post_content: announcement.post_content,
          post_header: announcement.post_header,
          edited: true,
        })
        .eq("post_id", announcement.post_id);

      if (error) {
        console.error("Edit Error:", error.message);
        throw error;
      }

      console.log("Announcement edited successfully.");

      fetchAnnouncements();
      setIsEditDialogOpen(false); // Close the edit dialog
      setAnnouncementToEdit(null); // Clear the selected announcement
    } catch (err) {
      setError("Error editing announcement. Please try again.");
      console.error("Error editing announcement:", err);
    }
  };

  // New function to handle deletion
  const handleDelete = async (postId) => {
    try {
      const { error } = await supabase
        .from("post_data")
        .delete()
        .eq("post_id", postId);
      if (error) {
        console.error("Delete Error:", error.message);
        throw error;
      }

      console.log("Announcement deleted successfully.");

      fetchAnnouncements();
    } catch (err) {
      setError("Error deleting announcement. Please try again.");
      console.error("Error deleting announcement:", err);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (post) =>
      post.post_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.post_header.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const loadMoreAnnouncements = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  return (
    <main className="flex min-h-screen w-full flex-col justify-center overflow-hidden">
      <div className="flex h-full w-full flex-col lg:flex-row">
        <div className="hidden p-4 lg:block lg:w-1/4">
          <VolunteerGroups groups={userGroups} onSelectGroup={setGroupId} />
        </div>

        <div className="p-4 lg:hidden">
          <Button className="w-full" onClick={() => setIsGroupDialogOpen(true)}>
            Select Group
          </Button>
        </div>

        <div
          className="no-scrollbar max-w-2xl flex-1 space-y-6 overflow-y-auto p-4 lg:p-8"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {announcementsLoading ? (
            <Spinner />
          ) : (
            <>
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Announcements</h1>
                  {userData && (
                    <p className="text-gray-600">
                      Welcome, {userData.user_name} {userData.user_last_name}
                    </p>
                  )}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-4">Create Announcement</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] h-full md:h-fit">
                    <DialogHeader>
                      <DialogTitle>Create New Announcement</DialogTitle>
                      <DialogDescription>
                        Post a new announcement for your group.
                      </DialogDescription>
                    </DialogHeader>
                    <AnnouncementForm
                      newAnnouncement={newAnnouncement}
                      setNewAnnouncement={setNewAnnouncement}
                      handleSubmit={handleSubmit}
                      error={error}
                      groupName={newAnnouncement.groupName}
                      setUploadedImage={setUploadedImage}
                    />
                  </DialogContent>
                </Dialog>
              </header>

              <GroupSelectionDialog
                isOpen={isGroupDialogOpen}
                onClose={() => setIsGroupDialogOpen(false)} // Close the correct dialog
                groups={userGroups}
                onSelectGroup={(id) => {
                  setGroupId(id);
                  setIsGroupDialogOpen(false); // Close the dialog after selecting a group
                }}
              />

              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="flex min-h-screen flex-col justify-start rounded-lg bg-gray-50 p-6 shadow-sm">
                {/* Adds background to the announcements section */}
                <div className="flex-1 space-y-4">
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.slice(0, visibleCount).map((post) => (
                      <AnnouncementCard
                        handleReaction={handleReaction}
                        key={post.post_id}
                        post={post}
                        userId={userData.user_id}
                        onEdit={() => {
                          setAnnouncementToEdit(post);
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      No announcements to display
                    </p>
                  )}
                </div>
              </div>

              {filteredAnnouncements.length > visibleCount && (
                <Button onClick={loadMoreAnnouncements} className="mt-4">
                  Load More
                </Button>
              )}

              {error && <div className="text-red-500">{error}</div>}
              {announcementsError && (
                <div className="text-red-500">{announcementsError}</div>
              )}

              {announcementToEdit && (
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogContent className="sm:max-w-[500px]">
                    <AnnouncementEdit
                      announcement={announcementToEdit}
                      setAnnouncement={setAnnouncementToEdit}
                      handleEdit={handleEdit}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
