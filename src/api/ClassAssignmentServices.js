import supabase from "@/api/supabase";

export const fetchAssignments = async (class_id) => {
  const { error, data } = await supabase
    .from("assignment_list")
    .select("*")
    .eq("class_id", class_id);

  if (error) {
    throw new Error(error || "unknown error");
  }

  return data;
};

export const addAssignment = async ({ inputs, date, class_id }) => {
  const dueDateUTC = new Date(date);
  //fixes the date so that it will not be 1 day behind in the database
  dueDateUTC.setHours(dueDateUTC.getHours() + 8);
  const { error: addError } = await supabase.from("assignment_list").insert([
    {
      title: inputs.title,
      description: inputs.description,
      due: dueDateUTC,
      quiz_link: inputs.quiz_link,
      quiz_for: inputs.participant,
      class_id: class_id,
    },
  ]);

  if (addError) {
    throw new Error(addError.error || "Unknown error");
  }
};

export const editAssignment = async ({ inputs, date, assignment_id }) => {
  console.log(inputs,date,assignment_id)
  const dueDateUTC = new Date(date);
  //fixes the date so that it will not be 1 day behind in the database
  dueDateUTC.setHours(dueDateUTC.getHours() + 8);

  const { error, data } = await supabase
    .from("assignment_list")
    .update({
      title: inputs.edittitle,
      description: inputs.editdescription,
      quiz_link: inputs.editquizlink,
      quiz_for: inputs.editparticipant,
      due: dueDateUTC,
    })
    .eq("id", assignment_id);

  if (error) {
    throw new Error(error || "unknown error");
  }
};

export const deleteAssignment = async (assignment_id) => {
  const { error } = await supabase
    .from("assignment_list")
    .delete()
    .eq("id", assignment_id);

  if (error) {
    throw new Error(error || "unknown error");
  }
};
