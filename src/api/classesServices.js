import supabase from "@/api/supabase";
import { addClassSchema } from "@/lib/zodSchema/classSchema";

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
  // console.log(" Classes:", combinedClasses);

  return combinedClasses;
};

export const addClass = async ({ input, user_id }) => {
  // console.log("id and input", input, user_id);
  
  if (!user_id) {
    throw new Error("Authentication required");
  }

  const validationResult = addClassSchema.safeParse(input)


  if(!validationResult.success){
    const errorMessage = validationResult.error.flatten().fieldErrors
    throw new Error(errorMessage)
  }

  const validatedData = validationResult.data



  const { data: existingClass, error: existError } = await supabase
    .from("volunteer_classes")
    .select("class_name")
    .eq("class_name", validatedData.classname)
    .eq("user_id", user_id)
    .maybeSingle();

  if (existError)
    throw new Error(existError.message || "Unknown error occurred");

  if (existingClass) {
    throw new Error("Class already exists!");
  }

  const { error, data } = await supabase
    .from("volunteer_classes")
    .insert([{ class_name: validatedData.classname, user_id }])
    .select("id")
    .single();

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
  familyMembers,
}) => {
  console.log("inputs", input, user_name, user_id, user_role);
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

  switch (user_role) {
    case "volunteer":
      // Check if the user already exists
      const volunteerCheck = await supabase
        .from("participant_volunteers")
        .select("*")
        .eq("user_id", user_id)
        .eq("class_id", classId)
        .single();

      if (volunteerCheck.data) {
        throw new Error("User already exists as a volunteer in this class.");
      }

      // Insert new volunteer
      const volunteerResponse = await supabase
        .from("participant_volunteers")
        .insert([
          {
            user_type: "volunteer",
            name: user_name,
            user_id: user_id,
            class_id: classId,
            is_approved: false,
          },
        ])
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
        .insert([
          {
            user_type: "parent",
            name: user_name,
            user_id: user_id,
            class_id: classId,
            is_approved: false,
          },
        ])
        .single();

      error = parentResponse.error;
      data = parentResponse.data;
      break;

    default:
      throw new Error("Invalid user role.");
  }
  if (error) throw new Error(error.message || "Unknown error occurred");
};

export const updateClass = async ({ input, class_id }) => {
  console.log("these are the data", input, class_id);


  const validationResult = addClassSchema.safeParse(input)

  if(!validationResult.success){
    const errorMessage = validatedData.error.flatten().fieldErrors
    throw new Error(errorMessage)
  }

  const validatedData = validationResult.data

  const { data: existingClass, error: existError } = await supabase
    .from("volunteer_classes")
    .select("class_name")
    .eq("class_name", validatedData.classname)
    .maybeSingle();

  if (existError)
    throw new Error(existError.message || "Unknown error occurred");
  
  if (existingClass) {
    throw new Error("Class Name already exists!");
  }

  const { error } = await supabase
    .from("volunteer_classes")
    .update({ class_name: validatedData.classname })
    .eq("id", class_id);

  console.log("Supabase response:", error);
  if (error) throw new Error(error.message || "Unknown error occurred");
};

export const insertFamilyMembers = async ({ familyMembers, classId }) => {
  console.log("data getting", familyMembers, classId);
  if (!familyMembers || familyMembers.length === 0) {
    throw new Error("Family Members have been added!");
  }

  const familyInsertPromises = familyMembers.map(async (member) => {
    // Check if the family member already exists
    const familyCheck = await supabase
      .from("participant_volunteers")
      .select("*")
      .eq("family_id", member.family_member_id)
      .eq("name", `${member.family_first_name} ${member.family_last_name}`)
      .eq("class_id", classId)
      .single();

    if (familyCheck.data) {
      throw new Error(
        `Family member ${member.family_first_name} ${member.family_last_name} already exists in this class.`,
      );
    }

    // Insert new family member
    return supabase.from("participant_volunteers").insert([
      {
        user_type: member.family_type === "Child" ? "child" : "parent",
        name: `${member.family_first_name} ${member.family_last_name}`,
        family_id: member.family_member_id,
        class_id: classId,
        is_approved: false,
      },
    ]);
  });

  const familyResponses = await Promise.all(familyInsertPromises);
  const familyErrors = familyResponses.filter((response) => response.error);

  if (familyErrors.length > 0) {
    const errorMessages = familyErrors
      .map((err) => err.error.message)
      .join(", ");
    throw new Error(`Error inserting family members: ${errorMessages}`);
  }
};
