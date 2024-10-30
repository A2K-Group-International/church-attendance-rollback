import supabase from "@/api/supabase";

export const fetchAllParticipants = async (class_id) => {
  const [
    volunteersResponse,
    parentsResponse,
    childrenResponse,
    classOwnerDetails,
  ] = await Promise.all([
    supabase
      .from("participant_volunteers")
      .select("*")
      .eq("class_id", class_id)
      .eq("user_type", "volunteer"),
    supabase
      .from("participant_volunteers")
      .select("*")
      .eq("class_id", class_id)
      .eq("user_type", "parent"),
    supabase
      .from("participant_volunteers")
      .select("*")
      .eq("class_id", class_id)
      .eq("user_type", "child"),
    supabase
      .from("volunteer_classes")
      .select("user_list(*)")
      .eq("id", class_id)
      .single(),
  ]);

  const errors = [
    volunteersResponse.error,
    parentsResponse.error,
    childrenResponse.error,
    classOwnerDetails.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0].message || "Unknown Error");
  }

  return {
    volunteers: volunteersResponse.data,
    parents: parentsResponse.data,
    children: childrenResponse.data,
    owner: classOwnerDetails.data.user_list,
  };
};

export const approveParticipants = async ({
  user_id,
  participant_id,
  columnName,
  classId,
  family_id,
}) => {
  console.log("my user id", user_id);
  const { error } = await supabase
    .from(columnName)
    .update({ is_approved: true })
    .eq("id", participant_id);

  if (error) {
    throw new Error(error.message);
  }

  const { data: classData, error: classError } = await supabase
    .from("volunteer_classes")
    .select("*")
    .eq("id", classId)
    .single();

  if (classError || !classData) {
    throw new Error("Class not found");
  }
  if (user_id) {
    const { error: insertJoinError } = await supabase
      .from("volunteer_joined_classes")
      .insert([{ user_id: user_id, class_id: classId }]);
    if (insertJoinError)
      throw new Error(insertJoinError.message || "Unknown error occurred");

    const { error: addError } = await supabase
      .from("volunteer_classes")
      .update({ class_total_students: classData.class_total_students + 1 })
      .eq("id", classId);

    if (addError) {
      throw new Error(addError.message || "Error updating total count");
    }
  } else {
    const { error: insertJoinError } = await supabase
      .from("volunteer_joined_classes")
      .insert([{ family_id: family_id, class_id: classId }]);
    if (insertJoinError)
      throw new Error(insertJoinError.message || "Unknown error occurred");

    const { error: addError } = await supabase
      .from("volunteer_classes")
      .update({ class_total_students: classData.class_total_students + 1 })
      .eq("id", classId);

    if (addError) {
      throw new Error(addError.message || "Error updating total count");
    }
  }
};

export const removeParticipants = async ({
  participant_id,
  tablename,
  user_id,
  family_id
}) => {
  console.log("my params",family_id, user_id, participant_id, tablename);

  const { data: participantData, error: fetchError } = await supabase
    .from(`participant_${tablename}`)
    .select("class_id")
    .eq("id", participant_id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message || "Error fetching participant data");
  }

  const classId = participantData.class_id;

  const { data, error } = await supabase
    .from(`participant_${tablename}`)
    .delete()
    .eq("id", participant_id);

  if (error) {
    throw new Error(error.message || "unknown error");
  }

  const { data: classData, error: classFetchError } = await supabase
    .from("volunteer_classes")
    .select("class_total_students")
    .eq("id", classId)
    .single();

  if (classFetchError) {
    throw new Error(classFetchError.message || "Error fetching class data");
  }

  const updatedTotal = classData.class_total_students - 1;

  // console.log("minus 1 to total");

  const { error: updateError } = await supabase
    .from("volunteer_classes")
    .update({ class_total_students: updatedTotal })
    .eq("id", classId);

  if (updateError) {
    throw new Error(updateError.message || "unknown error");
  }

  if (user_id) {
    const { error: removejoinError } = await supabase
      .from("volunteer_joined_classes")
      .delete()
      .eq("user_id", user_id)
      .eq("class_id", classId);

    if (removejoinError) {
      throw new Error(
        removejoinError.message || "An unknown error occurred during deletion.",
      );
    }
  } else {
    const { error: removejoinError } = await supabase
      .from("volunteer_joined_classes")
      .delete()
      .eq("family_id", family_id)
      .eq("class_id", classId);

    if (removejoinError) {
      throw new Error(
        removejoinError.message || "An unknown error occurred during deletion.",
      );
    }
  }

  return data;
};

export const changeParticipantRole = async ({ participant_id, newRole }) => {
  // Ensure the new role is valid
  const validRoles = ["parent", "child", "volunteer"];
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role specified");
  }

  const { error } = await supabase
    .from("participant_volunteers")
    .update({ user_type: newRole })
    .eq("id", participant_id);

  if (error) {
    throw new Error(error.message || "Error updating participant role");
  }

  return { message: "Role updated successfully" };
};

export const fetchFamilyMembers = async (participant_user_id) => {
  console.log("fetching family");
  const { data, error } = await supabase
    .from("family_list")
    .select("*")
    .eq("guardian_id", participant_user_id);

  if (error) {
    throw new Error(error.message || "Error fetching family members");
  }

  return data;
};
