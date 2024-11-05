import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/avatar";
import { Separator } from "@/shadcn/separator";
import { Textarea } from "@/shadcn/textarea";
import upload from "@/assets/svg/upload.svg";
import { Button } from "@/shadcn/button";
import { useState } from "react";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import remove from "@/assets/svg/remove.svg";
import supabase from "@/api/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shadcn/use-toast";
import useUserData from "@/api/useUserData";
import { useForm } from "react-hook-form";
import deleteIcon from "@/assets/svg/delete.svg";
import editIcon from "@/assets/svg/edit.svg";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/shadcn/dialog";
import Comments from "@/components/Comments";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  classContentSchema,
  editContentSchema,
} from "@/lib/zodSchema/classSchema";


export default function VolunteerClassContents() {
  const queryClient = useQueryClient();
  const { userData } = useUserData();
  const [files, setFiles] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors:adderrors },
  } = useForm({ resolver: zodResolver(classContentSchema) });
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors: editerrors },
  } = useForm({ resolver: zodResolver(editContentSchema) });
  const { toast } = useToast();
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);

  // if(!userData){
  //   return <Navigate to="/" replace />;
  // }

  const handleFileUpload = (event) => {
    // Convert FileList to array
    const selectedFiles = Array.from(event.target.files);
    // Create a preview URL for the file
    const filePreviews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    // Append new files with previews
    setFiles((prevFiles) => [...prevFiles, ...filePreviews]);
    setValue("files", selectedFiles);
  };

  const handleFileClick = (file) => {
    window.open(file);
  };

  const fetchClassContents = async () => {
    const { data: contents, error: contentsError } = await supabase
      .from("volunteer_class_content")
      .select("*")
      .eq("class_id", id)
      .order("created_at", { ascending: false });

    if (contentsError)
      throw new Error(contentsError.message || "Unknown error occurred");

    const contentsWithFiles = await Promise.all(
      contents.map(async (contents) => {
        const { data: filesData, error: filesError } = await supabase
          .from("content_files")
          .select("*")
          .eq("content_id", contents.id);

        if (filesError)
          throw new Error(filesError.message || "Error fetching files");

        const fileURLs = await Promise.all(
          filesData.map(async (file) => {
            // console.log("filepaths",file.filepath)
            const { data: fileURL, error: fileURLError } =
              await supabase.storage
                .from("Uploaded files")
                .getPublicUrl(file.file_path);

            if (fileURLError)
              throw new Error(
                fileURLError.message || "Error fetching file URL",
              );
            return {
              fileURL,
              file_path: file.file_path,
              file_type: file.file_type,
              file_name: file.file_name,
            };
          }),
        );
        // console.log("urls",fileURLs)
        return {
          ...contents,
          files: fileURLs || [],
        };
      }),
    );

    return contentsWithFiles;
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["classContents"],
    queryFn: fetchClassContents,
  });

  const createContent = async (inputData) => {
    const uploadPromises = inputData.files.map(async (filewithpreview) => {
      // console.log("this is each files before uploading", filewithpreview);
      const { data, error } = await supabase.storage
        .from("Uploaded files")
        .upload(
          `class_contents/${filewithpreview.file.name}`,
          filewithpreview.file,
        );

      if (error) throw new Error(error.message || "File upload error");

      return {
        file_path: data.path,
        file_type: filewithpreview.file.type,
        file_name: filewithpreview.file.name,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    const { data, error } = await supabase
      .from("volunteer_class_content")
      .insert([
        {
          postBy: `${userData.user_name} ${userData.user_last_name}`,
          content: inputData.input.content,
          class_id: id,
          user_id: userData.user_id,
        },
      ])
      .select("id");

    if (error) throw new Error(error.message || "Unknown error occurred");
    // console.log("data added", data[0].id);

    const insertFilePromises = uploadedFiles.map(async (file) => {
      const { error } = await supabase.from("content_files").insert([
        {
          content_id: data[0].id,
          file_path: file.file_path,
          file_type: file.file_type,
          file_name: file.file_name,
        },
      ]);

      if (error) throw new Error(error.message || "File insert error");
    });

    await Promise.all(insertFilePromises);
  };
  const updateContent = async (data) => {
    const { input } = data;
    const { error } = await supabase
      .from("volunteer_class_content")
      .update({ content: input.editcontent })
      .eq("id", currentId);

    if (error) throw new Error(error.message || "Update Failed");
  };
  const deleteContent = async (data) => {
    if (data.files.length > 0) {
      const filePaths = data.files.map((file) => file.file_path);
      // console.log("file paths to be deleted", filePaths);
      const { data: deletedData, error: storageDeleteError } =
        await supabase.storage.from("Uploaded files").remove(filePaths);

      if (storageDeleteError)
        throw new Error(
          storageDeleteError.message || "Failed to delete file from storage",
        );

      console.log("Files deleted from storage:", deletedData);
    }

    const { error } = await supabase
      .from("volunteer_class_content")
      .delete()
      .eq("id", currentId);

    if (error) throw new Error(error.message || "File insert error");
  };

  const createMutation = useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content Uploaded.",
      });
      reset();
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classContents"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteContent,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content deleted.",
      });

      reset();
      setIsDialogOpen(false);
      setFiles([]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classContents"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateContent,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content edited successfully.",
      });
      resetEdit();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["classContents"] });
    },
  });

  const onEditSubmit = (input) => {
    const data = { input };
    updateMutation.mutate(data);
  };

  const uploadContentHandler = (input) => {
    console.log("Inputs from form:", input);
    const data = {
      input,
      files,
    };

    createMutation.mutate(data);
  };
  const onDelete = (fileData) => {
    deleteMutation.mutate(fileData);
  };

  const renderFiles = (file, index) => {
    if (file.file_type.startsWith("image")) {
      // Render image
      return (
        <img
          className="cursor-pointer snap-start object-contain"
          onClick={() => handleFileClick(file.fileURL.publicUrl)}
          key={index}
          src={file.fileURL.publicUrl}
          alt="announcement image"
        />
      );
    } else if (file.file_type.startsWith("video")) {
      // Render video
      return (
        <video
          className="h-full w-full cursor-pointer snap-start object-contain"
          onClick={() => handleFileClick(file.fileURL.publicUrl)}
          controls
          key={index}
        >
          <source src={file.fileURL.publicUrl} type={file.file_type} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (file.file_type.startsWith("application")) {
      // Render download link
      return (
        <div
          key={index}
          className="m-2 flex items-center justify-center gap-2 rounded-md border p-3"
        >
          <a
            href={file.fileURL.publicUrl}
            className="w-fit cursor-pointer underline hover:cursor-pointer"
            download
          >
            {file.file_name}
          </a>
        </div>
      );
    } else {
      <a
        href={file.fileURL.publicUrl}
        className="mx-2 w-full cursor-pointer snap-start text-start underline hover:cursor-pointer lg:w-[35rem]"
        download
      >
        {file.filename}
      </a>;
    }
    return null;
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (data.length < 1 && userData?.user_role === "user") {
    return (
      <div className="flex justify-center">
        <p>nothing here yet.</p>
      </div>
    );
  }

  console.log(editerrors)


  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
      {userData?.user_role === "volunteer" && (
        <form
          onSubmit={handleSubmit(uploadContentHandler)}
          className="w-full rounded-md border p-4 shadow-md lg:w-3/5"
        >
          <Label className="text-md font-bold" htmlFor="content">
            Description
          </Label>
          <Textarea
            className="mb-2 resize-none"
            placeholder="Create a description for your content"
            {...register("content")}
          />
          {adderrors.content && (
            <p className="text-red-500">{adderrors.content.message}</p>
          )}
          <div className="mb-2 flex flex-col gap-2">
            {files.map((file, index) => (
              <div
                className="flex items-center gap-2 rounded-md border p-2 hover:bg-slate-200"
                key={index}
              >
                <div
                  onClick={() => handleFileClick(file.preview)}
                  className="flex flex-1 cursor-pointer gap-2"
                >
                  {file.file.type.startsWith("image/") && (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-12 w-12 rounded-md"
                    />
                  )}
                  <div className="flex h-10 items-center p-2">
                    <p>{file.file.name}</p>
                    {/* <p>{file.file.type}</p> */}
                  </div>
                </div>
                <div>
                  <img
                    className="mr-3 cursor-pointer"
                    src={remove}
                    alt="remove file"
                    onClick={() => {
                      setFiles((prevFiles) =>
                        prevFiles.filter((_, i) => i !== index),
                      );
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-300">
              <Label
                htmlFor="file-upload"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-300"
              >
                <img src={upload} alt="Upload" />
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
            </div>
            <div>
              <Button type="submit">Post</Button>
            </div>
          </div>
        </form>
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        data.map((values, index) => (
          <div
            key={index}
            className="mx-4 w-full rounded-md border p-4 shadow-md lg:w-3/5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{getInitial("Volunteer")}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p>{values.postBy}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(values.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {userData?.user_role === "volunteer" && (
                  <div className="flex gap-2">
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(isOpen) => {
                        setCurrentId(values.id);
                        setCurrentFiles(values.files);
                        setIsDialogOpen(isOpen);
                      }}
                    >
                      <DialogTrigger>
                        <img
                          src={deleteIcon}
                          alt="delete"
                          className="h-6 w-6"
                        />
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Delete Content
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <DialogDescription>
                          Are you sure you want to delete this content?
                        </DialogDescription>
                        <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                          <Button
                            onClick={() => setIsDialogOpen(false)}
                            variant="default"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              onDelete({ id: values.id, files: currentFiles })
                            }
                            // disabled={deletemutation.isLoading}
                          >
                            {/* {mutation.isLoading ? "Saving..." : "Save"} */}
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={(isOpen) => {
                        if (isOpen) {
                          // setEditValue("edittitle", values.title);
                          setEditValue("editcontent", values.content);
                          setCurrentId(values.id);
                        }
                        setIsEditDialogOpen(isOpen);
                      }}
                    >
                      <DialogTrigger>
                        <img src={editIcon} alt="edit" className="h-6 w-6" />
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Edit Content
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <form
                          id="editform"
                          onSubmit={handleEditSubmit((data) => {
                            onEditSubmit(data);
                          })}
                        >
                          {/* <Input
                            {...registerEdit("edittitle", { required: true })}
                            placeholder="Title of Content"
                            className="mt-1"
                          /> */}
                          <Label htmlFor="editcontent">Content</Label>
                          <Textarea
                            {...registerEdit("editcontent")}
                            placeholder="Put your content description here"
                            className="mt-1 resize-none"
                          />
                          {editerrors.editcontent && (
                            <p className="text-red-500">
                              {editerrors.editcontent.message}
                            </p>
                          )}
                        </form>
                        <DialogFooter className="mx-2 flex gap-2 sm:justify-between">
                          <Button
                            onClick={() => setIsEditDialogOpen(false)}
                            variant="destructive"
                          >
                            Cancel
                          </Button>
                          <Button form="editform" type="submit">
                            Edit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <div>
                <p className="mb-4 font-bold">{values.title}</p>
                <p style={{ whiteSpace: "pre-wrap" }} className="mb-4 text-sm">
                  {values.content}
                </p>
                {/* <p>{values.id}</p> */}

                <div className="flex snap-x snap-mandatory overflow-x-auto">
                  {values.files &&
                    values.files.map((file, index) => renderFiles(file, index))}
                </div>
              </div>
              <Separator className="my-3" />
              <Comments
                announcement_id={values?.id}
                columnName={"content_id"}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
