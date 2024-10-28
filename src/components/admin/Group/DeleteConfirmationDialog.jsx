import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../shadcn/button"; // Assuming Button is a separate component

const DeleteConfirmationDialog = ({ isOpen, onClose, groupName, onDelete }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">Confirm Delete</h2>
          <p className="mb-6">
            Are you sure you want to delete the group "{groupName}"?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDelete();
                onClose();
              }}
              variant="destructive"
              className="px-4 py-2"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    )
  );
};

// Define prop types for better type checking
DeleteConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DeleteConfirmationDialog;
