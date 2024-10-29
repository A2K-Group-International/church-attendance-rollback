import supabase from "./supabase";

export const fetchClassAnnouncements = async (class_id) => {
  const { data: announcements, error: announcementError } = await supabase
    .from("volunteer_announcements")
    .select("*")
    .eq("class_id", class_id)
    .order("created_at", { ascending: false });

  if (announcementError)
    throw new Error(announcementError.message || "Unknown error occurred");

  const announcementsWithFiles = await Promise.all(
    announcements.map(async (announcement) => {
      const { data: filesData, error: filesError } = await supabase
        .from("announcement_files")
        .select("*")
        .eq("announcement_id", announcement.id);

      if (filesError)
        throw new Error(filesError.message || "Error fetching files");

      const fileURLs = await Promise.all(
        filesData.map(async (file) => {
          const { data: fileURL, error: fileURLError } = await supabase.storage
            .from("Uploaded files")
            .getPublicUrl(file.filepath);

          if (fileURLError)
            throw new Error(fileURLError.message || "Error fetching file URL");
          return {
            fileURL,
            filepath: file.filepath,
            filetype: file.filetype,
            filename: file.filename,
          };
        }),
      );
      // Attach files data to the announcement
      return {
        ...announcement,
        files: fileURLs || [],
      };
    }),
  );

  return announcementsWithFiles;
};

export const createAnnouncement = async ({
  inputs,
  files,
  class_id,
  user_name,
  user_id,
}) => {
  console.log("files in service", files);
  const uploadPromises = files.map(async (filewithpreview) => {
    console.log("this is each files before uploading", filewithpreview);
    const { data, error } = await supabase.storage
      .from("Uploaded files")
      .upload(
        `class_announcements/${filewithpreview.file.name}`,
        filewithpreview.file,
      );

    if (error) throw new Error(error.message || "File upload error");

    return {
      filepath: data.path,
      filetype: filewithpreview.file.type,
      filename: filewithpreview.file.name,
    };
  });

  const uploadedFiles = await Promise.all(uploadPromises);

  const { data, error } = await supabase
    .from("volunteer_announcements")
    .insert([
      {
        postBy: user_name,
        title: inputs.title,
        content: inputs.content,
        class_id: class_id,
        user_id: user_id,
      },
    ])
    .select("id");

  if (error) throw new Error(error.message || "Unknown error occurred");

  const insertFilePromises = uploadedFiles.map(async (file) => {
    const { error } = await supabase.from("announcement_files").insert([
      {
        announcement_id: data[0].id,
        filepath: file.filepath,
        filetype: file.filetype,
        filename: file.filename,
      },
    ]);

    if (error) throw new Error(error.message || "File insert error");
  });

  await Promise.all(insertFilePromises);
};
export const updateAnnouncement = async ({ input, announcement_id }) => {
  const { error } = await supabase
    .from("volunteer_announcements")
    .update({ title: input.edittitle, content: input.editcontent })
    .eq("id", announcement_id);

  if (error) throw new Error(error.message || "Update Failed");
};

export const deleteAnnouncement = async ({ files, announcement_id }) => {
  console.log("my id",files, announcement_id);
  if (files.length > 0) {
    const filePaths = files.map((file) => file.filepath);
    console.log("file paths to be deleted", filePaths);
    const { data: deletedData, error: storageDeleteError } =
      await supabase.storage.from("Uploaded files").remove(filePaths);

    if (storageDeleteError)
      throw new Error(
        storageDeleteError.message || "Failed to delete file from storage",
      );

    console.log("Files deleted from storage:", deletedData);
  }

  const { error } = await supabase
    .from("volunteer_announcements")
    .delete()
    .eq("id", announcement_id);

  if (error) throw new Error(error.message || "File insert error");
};
