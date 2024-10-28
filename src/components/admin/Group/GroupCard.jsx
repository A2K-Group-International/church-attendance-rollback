import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../shadcn/button"; // Assuming Button is a separate component

const GroupCard = ({
  group,
  handleEditGroup,
  handleActionClick,
  handleOpenAssignModal,
  initiateRemoveMember,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleEdit = () => {
    handleEditGroup(group);
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    handleActionClick(group);
    setDropdownOpen(false);
  };

  const handleAssignMembers = () => {
    handleOpenAssignModal(group);
    setDropdownOpen(false);
  };

  return (
    <div className="relative rounded-lg border p-6 shadow transition-shadow duration-300 hover:shadow-lg">
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="absolute right-4 top-4 focus:outline-none"
      >
        {/* Three dots icon */}
        <span className="mb-1 block h-1 w-1 rounded-full bg-gray-600" />
        <span className="mb-1 block h-1 w-1 rounded-full bg-gray-600" />
        <span className="block h-1 w-1 rounded-full bg-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-4 top-12 z-10 rounded border bg-white shadow-md">
          <button
            onClick={handleEdit}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Delete
          </button>
          <button
            onClick={handleAssignMembers}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Assign Members
          </button>
        </div>
      )}

      <h2 className="mb-2 text-2xl font-bold">{group.group_name}</h2>

      {/* Description Box with Fixed Height */}
      <div className="mb-4 h-24 overflow-hidden">
        <p className="text-gray-700">{group.group_description}</p>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        Created At: {new Date(group.created_at).toLocaleString()}
      </p>

      {/* Displaying Members with Fixed Height and Scroll */}
      <div className="mb-6 h-32 overflow-y-auto border-t border-gray-300 pt-4">
        <h3 className="mb-2 text-lg font-semibold">Members:</h3>
        {group.members && group.members.length > 0 ? (
          <ul className="list-disc space-y-2 pl-5">
            {group.members.map((member) => (
              <li
                key={member.user_id}
                className="flex items-center justify-between space-x-4"
              >
                <span className="text-gray-800">
                  {member.user_name} {member.user_last_name}
                </span>
                <button
                  onClick={() => initiateRemoveMember(member)} // Open confirmation dialog
                  className="font-medium text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No members found.</p>
        )}
      </div>
    </div>
  );
};

// Define prop types for better type checking
GroupCard.propTypes = {
  group: PropTypes.shape({
    group_id: PropTypes.string.isRequired,
    group_name: PropTypes.string.isRequired,
    group_description: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        user_id: PropTypes.string.isRequired,
        user_name: PropTypes.string.isRequired,
        user_last_name: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  handleEditGroup: PropTypes.func.isRequired,
  handleActionClick: PropTypes.func.isRequired,
  handleOpenAssignModal: PropTypes.func.isRequired,
  initiateRemoveMember: PropTypes.func.isRequired,
};

export default GroupCard;
