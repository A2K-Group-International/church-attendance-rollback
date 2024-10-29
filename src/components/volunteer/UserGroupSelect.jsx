import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select"; // Import ShadCN select

const UserGroupSelect = ({ onSelect, groupId }) => {
  const { userGroups, loading, error } = useUser();
  const [selectedGroup, setSelectedGroup] = useState("");

  // Update selectedGroup when groupId prop changes
  useEffect(() => {
    setSelectedGroup(groupId); // Set the selectedGroup based on the incoming groupId
  }, [groupId]);

  const handleSelectChange = (groupId) => {
    setSelectedGroup(groupId);
    onSelect(groupId); // Call the onSelect function passed as a prop
  };

  if (loading) return <p>Loading groups...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <label htmlFor="userGroup" className="mb-2 block">
        Filter by group:
      </label>
      <Select onValueChange={handleSelectChange} value={selectedGroup}>
        <SelectTrigger className="rounded border p-2">
          {/* Display the selected group's name or a placeholder */}
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {userGroups.map((group) => (
            <SelectItem key={group.group_id} value={group.group_id}>
              {group.group_name} {/* Displaying the group name */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserGroupSelect;
