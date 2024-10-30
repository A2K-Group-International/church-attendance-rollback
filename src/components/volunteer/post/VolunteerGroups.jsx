import React from "react";

const VolunteerGroups = ({ groups, onSelectGroup }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-4 text-xl font-bold">My Ministries</h2>
      <ul>
        {/* "All" option */}
        <li
          key="all-groups"
          className="flex cursor-pointer items-center justify-between border-b p-2 hover:bg-gray-100"
          onClick={() => onSelectGroup(null)} // Pass null or a specific value for "All"
        >
          <span>All Ministries</span>
          <span className="text-gray-500" style={{ display: "none" }}>
            {/* Hidden element for consistency; can be removed if not needed */}
            0
          </span>
        </li>
        {groups.map((group) => (
          <li
            key={group.group_id}
            className="flex cursor-pointer items-center justify-between border-b p-2 hover:bg-gray-100"
            onClick={() => onSelectGroup(group.group_id)} // Handle group selection
          >
            <span>{group.group_name}</span>
            <span className="text-gray-500" style={{ display: "none" }}>
              {group.id}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VolunteerGroups;
