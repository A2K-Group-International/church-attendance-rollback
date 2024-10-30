import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import supabase from "../../api/supabase";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import CreateGroupModal from "@/components/admin/Group/CreateGroupModal";
import EditGroupModal from "@/components/admin/Group/EditGroupModal";
import GroupList from "@/components/admin/Group/GroupList";
import AssignMembersModal from "@/components/admin/Group/AssignMembersModal";
import RemoveMemberDialog from "@/components/admin/Group/RemoveMemberDiaglog";
import DeleteConfirmationDialog from "@/components/admin/Group/DeleteConfirmationDialog";
import LoadingDialog from "@/components/admin/Group/LoadingDialog";
// Define the number of items per page
const itemsPerPage = 7;

export default function GroupsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Fetch groups and their members
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: fetchedData,
        error,
        count,
      } = await supabase
        .from("group_list")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (error) throw error;

      // Fetch members for each group from group_user_assignments
      const groupsWithMembers = await Promise.all(
        fetchedData.map(async (group) => {
          const { data: members, error: memberError } = await supabase
            .from("group_user_assignments")
            .select("user_id, user_list(user_name, user_last_name)") // Fetch related user data directly
            .eq("group_id", group.group_id);

          if (memberError) {
            console.error("Fetch Members Error:", memberError);
            return { ...group, members: [] }; // Return empty members array on error
          }

          // Map the members to include user_name and user_last_name
          const mappedMembers = members.map((member) => ({
            user_id: member.user_id, // This should be present in the member's structure
            user_name: member.user_list.user_name, // Accessing user name from user_list
            user_last_name: member.user_list.user_last_name, // Accessing user last name from user_list
          }));

          return { ...group, members: mappedMembers }; // Return members with user data
        }),
      );

      setTotalPages(Math.ceil(count / itemsPerPage));
      setData(groupsWithMembers);
    } catch (error) {
      setError("Error fetching groups. Please try again.");
      console.error("Fetch Groups Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch all volunteers (for assignment)
  const fetchAllVolunteers = useCallback(async () => {
    try {
      const { data: volunteers, error } = await supabase
        .from("user_list")
        .select("*")
        .eq("user_role", "volunteer")
        .is("group_id", null); // Only fetch volunteers with no group assigned

      if (error) throw error;

      // Filter out volunteers who are already members of the selected group
      const currentMembers =
        selectedGroup?.members.map((member) => member.user_id) || [];
      const filteredVolunteers = volunteers.filter(
        (volunteer) => !currentMembers.includes(volunteer.user_id),
      );

      setAllVolunteers(filteredVolunteers);
    } catch (error) {
      console.error("Fetch Volunteers Error:", error);
      setAssignError("Error fetching volunteers. Please try again.");
    }
  }, [selectedGroup]);

  useEffect(() => {
    fetchData();
  }, [currentPage, fetchData]);
  useEffect(() => {
    if (isAssignModalOpen) {
      fetchAllVolunteers();
      setSelectedVolunteers([]);
    }
  }, [isAssignModalOpen, fetchAllVolunteers]);

  // Fetch all volunteers when Assign Members modal is opened
  useEffect(() => {
    if (isAssignModalOpen) {
      fetchAllVolunteers();
      setSelectedVolunteers([]);
    }
  }, [isAssignModalOpen, fetchAllVolunteers]);

  // Handle creation of a new group
  const handleCreateGroup = async (formData) => {
    setCreateLoading(true);
    setCreateError(null);
    try {
      const { groupName, groupDescription } = formData;
      const newGroup = {
        group_name: groupName,
        group_description: groupDescription,
      };

      const { error: insertError } = await supabase
        .from("group_list")
        .insert([newGroup]);

      if (insertError) throw insertError;

      fetchData();
      setIsCreateModalOpen(false);
      reset();
    } catch (error) {
      setCreateError(
        error.message || "Failed to create group. Please try again.",
      );
      console.error("Create Group Error:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle editing a group
  const handleEditGroup = (groupData) => {
    setSelectedGroup(groupData);
    setValue("groupName", groupData.group_name);
    setValue("groupDescription", groupData.group_description);
    setIsEditModalOpen(true);
  };

  // Handle updating a group
  const handleUpdateGroup = async (formData) => {
    setEditLoading(true);
    setEditError(null);
    try {
      const { groupName, groupDescription } = formData;
      const updatedGroup = {
        group_name: groupName,
        group_description: groupDescription,
      };

      const { error: updateError } = await supabase
        .from("group_list")
        .update(updatedGroup)
        .eq("group_id", selectedGroup.group_id);

      if (updateError) throw updateError;

      fetchData();
      setIsEditModalOpen(false);
      reset();
    } catch (error) {
      setEditError(
        error.message || "Failed to update group. Please try again.",
      );
      console.error("Update Group Error:", error);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle opening the confirmation dialog (e.g., for deleting a group)
  const handleActionClick = (groupData) => {
    setSelectedGroup(groupData);
    setIsDialogOpen(true);
  };

  // Confirm deletion of a group
  const confirmDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabase
        .from("group_list")
        .delete()
        .eq("group_id", selectedGroup.group_id);

      if (error) throw error;

      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      setError("Failed to delete group. Please try again.");
      console.error("Delete Group Error:", error);
    }
  };

  // Handle opening the Assign Members modal
  const handleOpenAssignModal = (groupData) => {
    setSelectedGroup(groupData);
    setIsAssignModalOpen(true);
  };

  // Handle assigning selected volunteers to the group
  const handleAssignMembers = async () => {
    if (selectedVolunteers.length === 0) {
      setAssignError("Please select at least one volunteer to assign.");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      const assignments = selectedVolunteers.map((userId) => ({
        user_id: userId,
        group_id: selectedGroup.group_id,
      }));

      // Insert into group_user_assignments
      const { error } = await supabase
        .from("group_user_assignments")
        .upsert(assignments, { onConflict: ["user_id", "group_id"] });

      if (error) throw error;

      fetchData();
      setIsAssignModalOpen(false);
    } catch (error) {
      setAssignError(
        error.message || "Failed to assign members. Please try again.",
      );
      console.error("Assign Members Error:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  // Function to initiate removing a member (opens confirmation dialog)
  const initiateRemoveMember = (member, group) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
    setSelectedGroup(group); // Ensure selectedGroup is set
  };

  // Function to remove a member from a group
  const removeMemberFromGroup = async (userId) => {
    try {
      const { error } = await supabase
        .from("group_user_assignments")
        .delete()
        .match({ user_id: userId, group_id: selectedGroup.group_id });

      if (error) throw error;

      console.log(`Member with user_id: ${userId} removed from the group`);
      fetchData(); // Refetch the groups and their members to reflect the change
    } catch (error) {
      console.error("Remove Member Error:", error);
      setAssignError("Error removing the member. Please try again.");
    }
  };

  // Handle checkbox change for volunteer selection
  const handleCheckboxChange = (userId) => {
    setSelectedVolunteers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    // <AdminSidebar>
    <main className="mx-auto max-h-screen max-w-7xl overflow-y-auto p-4 lg:p-8">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ministry Management</h1>
      </div>
      {/* Create Group Button */}
      <div className="mb-8">
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
        >
          Create Ministry
        </Button>
      </div>
      {/* Group Cards Layout */}
      <GroupList
        data={data}
        loading={loading}
        error={error}
        handleEditGroup={handleEditGroup}
        handleActionClick={handleActionClick}
        handleOpenAssignModal={handleOpenAssignModal}
        initiateRemoveMember={initiateRemoveMember}
      />

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center space-x-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          variant="secondary"
          className="px-4 py-2"
        >
          Previous
        </Button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          variant="secondary"
          className="px-4 py-2"
        >
          Next
        </Button>
      </div>
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
        createLoading={createLoading}
        createError={createError}
      />
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateGroup}
        editLoading={editLoading}
        editError={editError}
        selectedGroup={selectedGroup}
      />
      <AssignMembersModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        groupName={selectedGroup?.group_name || ""}
        allVolunteers={allVolunteers}
        selectedVolunteers={selectedVolunteers}
        handleCheckboxChange={handleCheckboxChange}
        handleAssignMembers={handleAssignMembers}
        assignError={assignError}
        assignLoading={assignLoading}
      />
      <RemoveMemberDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        memberToRemove={memberToRemove || ""}
        onRemove={removeMemberFromGroup}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        groupName={selectedGroup ? selectedGroup.group_name : ""}
        onDelete={confirmDeleteGroup}
      />
    </main>
    // </AdminSidebar>
  );
}
