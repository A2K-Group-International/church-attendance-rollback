import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../shadcn/button"; // Assuming Button is a separate component
import { Label } from "../../../shadcn/label"; // Assuming Label is a separate component

const AssignMembersModal = ({
  isOpen,
  onClose,
  groupName,
  allVolunteers,
  selectedVolunteers,
  handleCheckboxChange,
  handleAssignMembers,
  assignError,
  assignLoading,
}) => {
  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold">
            Assign Members to "{groupName}"
          </h2>
          {assignError && <p className="mb-4 text-red-600">{assignError}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAssignMembers();
            }}
          >
            <div className="mb-6">
              <Label className="mb-2 block">Select Volunteers</Label>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded border p-4">
                {allVolunteers.length > 0 ? (
                  allVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.user_id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`volunteer-${volunteer.user_id}`}
                        checked={selectedVolunteers.includes(volunteer.user_id)}
                        onChange={() => handleCheckboxChange(volunteer.user_id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`volunteer-${volunteer.user_id}`}
                        className="text-gray-700"
                      >
                        {volunteer.user_name} {volunteer.user_last_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No volunteers available.</p>
                )}
              </div>
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
                disabled={assignLoading}
              >
                {assignLoading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

// Define prop types for better type checking
AssignMembersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  allVolunteers: PropTypes.arrayOf(
    PropTypes.shape({
      user_id: PropTypes.string.isRequired,
      user_name: PropTypes.string.isRequired,
      user_last_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedVolunteers: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
  handleAssignMembers: PropTypes.func.isRequired,
  assignError: PropTypes.string,
  assignLoading: PropTypes.bool,
};

export default AssignMembersModal;
