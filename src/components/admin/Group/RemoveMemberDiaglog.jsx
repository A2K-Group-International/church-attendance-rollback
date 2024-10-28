import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../shadcn/button"; // Assuming Button is a separate component

const RemoveMemberDialog = ({ isOpen, onClose, memberToRemove, onRemove }) => {
  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">Confirm Removal</h2>
          <p className="mb-6">
            Are you sure you want to remove{" "}
            <strong>
              {memberToRemove.user_name} {memberToRemove.user_last_name}
            </strong>{" "}
            from the group?
          </p>
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
              onClick={() => {
                onRemove(memberToRemove.user_id);
                onClose();
              }}
              variant="destructive"
              className="px-4 py-2"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    )
  );
};

// Define prop types for better type checking
RemoveMemberDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  memberToRemove: PropTypes.shape({
    user_id: PropTypes.string.isRequired,
    user_name: PropTypes.string.isRequired,
    user_last_name: PropTypes.string.isRequired,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default RemoveMemberDialog;
