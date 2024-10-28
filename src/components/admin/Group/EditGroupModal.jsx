import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../shadcn/button"; // Adjust imports based on your project structure
import { Input } from "../../../shadcn/input"; // Adjust imports based on your project structure
import { Label } from "../../../shadcn/label"; // Adjust imports based on your project structure

const EditGroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  editLoading,
  editError,
  selectedGroup,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Set default values when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      reset({
        groupName: selectedGroup.group_name || "",
        groupDescription: selectedGroup.group_description || "",
      });
    }
  }, [selectedGroup, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Edit Group</h2>
        {editError && <p className="mb-4 text-red-600">{editError}</p>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Label htmlFor="groupName" className="mb-1 block">
              Group Name
            </Label>
            <Input
              id="groupName"
              {...register("groupName", { required: true })}
              placeholder="Enter group name"
              className="w-full"
            />
            {errors.groupName && (
              <p className="mt-1 text-red-600">Group name is required.</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="groupDescription" className="mb-1 block">
              Group Description
            </Label>
            <Input
              id="groupDescription"
              {...register("groupDescription", { required: true })}
              placeholder="Enter group description"
              className="w-full"
            />
            {errors.groupDescription && (
              <p className="mt-1 text-red-600">Description is required.</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-4 py-2"
              disabled={editLoading}
            >
              {editLoading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
