import React from "react";
import PropTypes from "prop-types";
import GroupCard from "./GroupCard"; // Import the new GroupCard component

const GroupList = ({
  data,
  error,
  handleEditGroup,
  handleActionClick,
  handleOpenAssignModal,
  initiateRemoveMember,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {error ? (
        <div className="p-8 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      ) : data.length > 0 ? (
        data.map((item) => (
          <GroupCard
            key={item.group_id}
            group={item}
            handleEditGroup={handleEditGroup}
            handleActionClick={handleActionClick}
            handleOpenAssignModal={handleOpenAssignModal}
            initiateRemoveMember={initiateRemoveMember}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <p>No groups found.</p>
        </div>
      )}
    </div>
  );
};

// Define prop types for better type checking
GroupList.propTypes = {
  data: PropTypes.array.isRequired,
  error: PropTypes.string,
  handleEditGroup: PropTypes.func.isRequired,
  handleActionClick: PropTypes.func.isRequired,
  handleOpenAssignModal: PropTypes.func.isRequired,
  initiateRemoveMember: PropTypes.func.isRequired,
};

export default GroupList;
