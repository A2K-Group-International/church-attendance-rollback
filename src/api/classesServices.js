import supabase from "@/api/supabase";

export const getClasses = async (user_id) => {
  const { data: ownedClasses, error: ownedError } = await supabase
    .from("volunteer_classes")
    .select("*")
    .eq("user_id", user_id);

  if (ownedError)
    throw new Error(ownedError.message || "Error fetching owned classes");

  const { data: joinedClasses, error: joinedError } = await supabase
    .from("volunteer_joined_classes")
    .select("class_id, volunteer_classes(*)")
    .eq("user_id", user_id);

  if (joinedError)
    throw new Error(joinedError.message || "Error fetching joined classes");

  const combinedClasses = [
    ...ownedClasses.map((classItem) => ({ ...classItem, status: "owned" })),
    ...joinedClasses.map((joinedItem) => ({
      ...joinedItem.volunteer_classes,
      status: "joined",
    })),
  ];
  console.log(" Classes:", combinedClasses);

  return combinedClasses;
};

export const addClass = async ({ input, user_id }) => {
  console.log("id and input", input, user_id);
  if (!user_id) {
    throw new Error("Authentication required");
  }

  const { data: existingClass, error: existError } = await supabase
    .from("volunteer_classes")
    .select("class_name")
    .eq("class_name", input.classname)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existError)
    throw new Error(existError.message || "Unknown error occurred");
  if (existingClass) {
    throw new Error("Class already exists!");
  }

  const { error, data } = await supabase
    .from("volunteer_classes")
    .insert([{ class_name: input.classname, user_id }])
    .select("id")
    .single();

  console.log("Supabase response:", error);
  if (error) throw new Error(error.message || "Unknown error occurred");
};

export const deleteClass = async ({ class_id }) => {
  console.log("class id asdgsa", class_id);
  if (!class_id) {
    throw new Error("class ID required");
  }
  const { error } = await supabase
    .from("volunteer_classes")
    .delete()
    .eq("id", class_id);

  console.log("Supabase response:", error);
  if (error) throw new Error(error.message || "Unknown error occurred");
};

export const joinClassAction = async ({
  input,
  user_name,
  user_id,
  user_role,
}) => {
  console.log("inputs", input, user_name, user_id,user_role );
  let error;
  let data;
  if ((!input, !user_name, !user_id)) {
    throw new Error("input, user_name, user_id is required!");
  }

  const { data: classData, error: classError } = await supabase
    .from("volunteer_classes")
    .select("*")
    .eq("class_code", input.classCode)
    .single();

  if (classError || !classData) {
    throw new Error("Class not found");
  }

  const classId = classData.id;

  const { data: approvalExist } = await supabase
    .from("join_requests")
    .select("*")
    .eq("class_id", classId)
    .eq("volunteer_id", user_id)
    .single();

  if (approvalExist) {
    throw new Error("Request to join already sent!");
  }


  // const { data: classExisting, error: existingError } = await supabase
  //   .from("volunteer_joined_classes")
  //   .select("*")
  //   .eq("class_id", classId)
  //   .eq("user_id", user_id)
  //   .maybeSingle();

  // if (classExisting) {
  //   throw new Error("You have already requested to joined this class");
  // }

  // if (existingError) {
  //   throw new Error(existingError.message || "Error checking class membership");
  // }

  switch (user_role) {
    case "volunteer":
      // Check if the user already exists
      const volunteerCheck = await supabase
        .from("participant_volunteers")
        .select("*")
        .eq("name", user_name)
        .eq("class_id", classId)
        .single();

      if (volunteerCheck.data) {
        throw new Error("User already exists as a volunteer in this class.");
      }

      // Insert new volunteer
      const volunteerResponse = await supabase
        .from("participant_volunteers")
        .insert([{ name: user_name,user_id:user_id, class_id: classId, is_approved: false }])
        .single();

      error = volunteerResponse.error;
      data = volunteerResponse.data;
      break;

    case "user":
      // Check if the user already exists
      const parentCheck = await supabase
        .from("participant_volunteers")
        .select("*")
        .eq("name", user_name)
        .eq("class_id", classId)
        .single();

      if (parentCheck.data) {
        throw new Error("User already exists as a parent in this class.");
      }

      // Insert new parent
      const parentResponse = await supabase
        .from("participant_volunteers")
        .insert([{ user_type:"parent", name: user_name, user_id:user_id,class_id: classId, is_approved: false }])
        .single();

      error = parentResponse.error;
      data = parentResponse.data;
      break;

    case "child":
      // Check if the user already exists
      const childCheck = await supabase
        .from("participant_children")
        .select("*")
        .eq("name", user_name)
        .eq("class_id", classId)
        .single();

      if (childCheck.data) {
        throw new Error("User already exists as a child in this class.");
      }

      // Insert new child
      const childResponse = await supabase
        .from("participant_children")
        .insert([{ name: user_name,user_id:user_id, class_id: classId, is_approved: false }])
        .single();

      error = childResponse.error;
      data = childResponse.data;
      break;

    default:
      throw new Error("Invalid user role.");
  }

  // const { error: approvalError } = await supabase
  // .from("join_requests")
  // .insert([
  //   {
  //     entity_type: "parent",
  //     volunteer_id: data.id,
  //     class_id: classId,
  //     is_admin_approved: false,
  //   },
  // ]);

// if (approvalError) {
//   throw new Error(approvalError.message || "Error adding approval entry");
// }

  // const { error: insertJoinError } = await supabase
  //   .from("volunteer_joined_classes")
  //   .insert([{ user_id: user_id, class_id: classId }]);
  // if (insertJoinError)
  //   throw new Error(insertJoinError.message || "Unknown error occurred");

  // const { error: addError } = await supabase
  //   .from("volunteer_classes")
  //   .update({ class_total_students: classData.class_total_students + 1 })
  //   .eq("id", classId);

  // if (addError) {
  //   throw new Error(addError.message || "Error updating total count");
  // }
  if (error) throw new Error(error.message || "Unknown error occurred");
};

export const updateClass = async ({ input, class_id }) => {
  // console.log("these are the data", input, class_id);
  const { error } = await supabase
    .from("volunteer_classes")
    .update({ class_name: input.classname })
    .eq("id", class_id);

  console.log("Supabase response:", error);
  if (error) throw new Error(error.message || "Unknown error occurred");
};
