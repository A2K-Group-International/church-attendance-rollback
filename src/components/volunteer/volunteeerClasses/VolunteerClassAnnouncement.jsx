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
import useClassAnnouncements from "@/hooks/useClassAnnouncements";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  classAnnouncementSchema,
  editClassAnnouncementSchema,
} from "@/lib/zodSchema/classSchema";
import { z } from "zod";

export default function VolunteerClassAnnouncement() {
  const { userData } = useUserData();
  const [files, setFiles] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors:adderrors },
  } = useForm({
    resolver: zodResolver(classAnnouncementSchema),
  });
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors:editerrors },
  } = useForm({resolver: zodResolver(editClassAnnouncementSchema)});

  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentFiles, setCurrentFiles] = useState([]);

  const {
    data,
    isLoading,
    isFetching,
    updateAnnouncementMutation,
    deleteAnnouncementMutation,
    createAnnouncementMutation,
  } = useClassAnnouncements(id);

  const handleFileUpload = (event) => {
    // Convert FileList to array
    const selectedFiles = Array.from(event.target.files);

    const filePreviews = selectedFiles.map((file) => ({
      file,
      // Create a preview URL for the file
      preview: URL.createObjectURL(file),
    }));
    // Append new files with previews
    setFiles((prevFiles) => [...prevFiles, ...filePreviews]);
    setValue("files", selectedFiles);
  };

  const handleFileClick = (file) => {
    window.open(file);
  };

  const renderFiles = (file, index) => {
    if (file.filetype.includes("image")) {
      // Render image
      return (
        <img
          className="h-full w-full flex-1 cursor-pointer snap-start object-contain"
          onClick={() => handleFileClick(file.fileURL.publicUrl)}
          key={index}
          src={file.fileURL.publicUrl}
          alt="announcement image"
          onError={() =>
            console.error("Image failed to load:", file.fileURL.publicUrl)
          } // Log error
        />
      );
    } else if (file.filetype.startsWith("video")) {
      // Render video
      return (
        <video
          className="h-full w-full flex-1 cursor-pointer snap-start object-contain"
          controls
          key={index}
        >
          <source src={file.fileURL.publicUrl} type={file.filetype} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (file.filetype.startsWith("application")) {
      // Render download link
      return (
        <div
          key={index}
          className="mx-1 flex w-full flex-1 flex-grow items-center justify-center gap-2 rounded-md border p-3"
        >
          <a
            href={file.fileURL.publicUrl}
            className="w-full flex-1 flex-grow cursor-pointer underline hover:cursor-pointer"
            download
          >
            {file.filename}
          </a>
        </div>
      );
    } else {
      <a
        href={file.fileURL.publicUrl}
        className="mx-2 h-full w-full flex-1 flex-grow cursor-pointer underline hover:cursor-pointer lg:w-[35rem]"
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

  // console.log("nagana me");
  // console.log(editerrors)

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 p-2">
      {userData?.user_role === "volunteer" && (
        <form
          onSubmit={handleSubmit((inputs) => {
            console.log("inputs", inputs);
            createAnnouncementMutation.mutate({
              inputs,
              files,
              class_id: id,
              user_name: userData?.user_name,
              user_id: userData?.user_id,
              reset,
              setFiles,
            });
          })}
          className="w-full rounded-md border p-4 shadow-md lg:w-3/5"
        >
          <Label className=" font-bold text-md" htmlFor="title">Title</Label>
          <Input
            className="mb-2"
            placeholder="Title of Highlight"
            {...register("title")}
          />
          {adderrors.title && (
            <p className="text-red-500">{adderrors.title.message}</p>
          )}
           <Label className=" font-bold text-md" htmlFor="content">Content</Label>
          <Textarea
            className="mb-2"
            placeholder="Create a highlight for your class."
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
              <Button
                disabled={createAnnouncementMutation.isPending}
                type="submit"
              >
                {createAnnouncementMutation.isPending ? "Posting" : "Post"}
              </Button>
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
                        setIsDialogOpen(isOpen);
                        setCurrentFiles(values.files);
                      }}
                    >
                      <DialogTrigger>
                        {userData?.user_role === "volunteer" && (
                          <img
                            src={deleteIcon}
                            alt="delete"
                            className="h-6 w-6"
                          />
                        )}
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Delete Highlight
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <DialogDescription>
                          Are you sure you want to delete highlight?
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
                            onClick={() => {
                              // console.log("Files to delete:", values.files);
                              deleteAnnouncementMutation.mutate({
                                files: currentFiles,
                                announcement_id: currentId,
                                setFiles,
                                setIsDialogOpen,
                              });
                            }}
                            disabled={deleteAnnouncementMutation.isPending}
                          >
                            {deleteAnnouncementMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isEditDialogOpen}
                      onOpenChange={(isOpen) => {
                        if (isOpen) {
                          setEditValue("edittitle", values.title);
                          setEditValue("editcontent", values.content);
                          setCurrentId(values.id);
                        }
                        setIsEditDialogOpen(isOpen);
                      }}
                    >
                      <DialogTrigger>
                        {userData?.user_role === "volunteer" && (
                          <img src={editIcon} alt="edit" className="h-6 w-6" />
                        )}
                      </DialogTrigger>
                      <DialogContent className="rounded-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Edit Highlight
                          </DialogTitle>
                          <Separator />
                        </DialogHeader>
                        <form
                          id="editform"
                          onSubmit={handleEditSubmit((input) =>{
                            console.log("inputs",input)
                            updateAnnouncementMutation.mutate({
                              input,
                              announcement_id: currentId,
                              resetEdit,
                              setIsEditDialogOpen,
                            });
                          })}
                        >
                          <Label htmlFor="edittitle">Title</Label>
                          <Input
                            {...registerEdit("edittitle")} 
                            placeholder="Title of Highlight"
                            className="mt-1"
                          />
                          {editerrors.edittitle && (
                            <p className="text-red-500">
                              {editerrors.edittitle.message}
                            </p>
                          )}
                          <Label htmlFor="editcontent">Highlight</Label>
                          <Textarea
                            {...registerEdit("editcontent")}
                            placeholder="Put your highlight here"
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
                          <Button
                            disabled={updateAnnouncementMutation.isPending}
                            form="editform"
                            type="submit"
                          >
                            {updateAnnouncementMutation.isPending
                              ? "Editing..."
                              : "Edit"}
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

                <div className="flex overflow-x-auto">
                  {values.files &&
                    values.files.map((file, index) => renderFiles(file, index))}
                </div>
              </div>
              <Separator className="mt-3" />

              <Comments
                announcement_id={values?.id}
                columnName={"announcement_id"}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
