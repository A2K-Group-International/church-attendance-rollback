import { z } from "zod";

export const addClassSchema = z.object({
  classname: z.string().min(1, "Group name is required."),
});

export const joinClassSchema = z.object({
  classCode: z.string().min(1, "Group code is required."),
});

export const classAnnouncementSchema = z.object({
    title: z.string().min(1,"Title is required"),
    content: z.string().min(1, "Content is required"),
    files: z.array(z.instanceof(File)).optional()
})
export const editClassAnnouncementSchema = z.object({
    edittitle: z.string().min(1,"Title is required"),
    editcontent: z.string().min(1, "Content is required"),
    files: z.array(z.instanceof(File)).optional()
})

export const classContentSchema = z.object({
    content: z.string().min(1, "Content is required"),
})
export const editContentSchema = z.object({
    editcontent: z.string().min(1, "Content is required"),
})

export const addquizSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  quiz_link: z
    .string()
    .url({ message: "Quiz link must be a valid URL" })
    .min(1, { message: "Quiz link is required" }),
  participant: z.enum(["child", "parent", "volunteer"], {
    message: "Participant must be selected",
  }),
  due_date: z
    .string()
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      { message: "Invalid date format" }
    )
    .optional(),
});

export const editQuizSchema = z.object({
  edittitle: z.string().min(1, { message: "Title is required" }),
  editdescription: z.string().min(1, { message: "Description is required" }),
  editquizlink: z
    .string()
    .url({ message: "Quiz link must be a valid URL" })
    .min(1, { message: "Quiz link is required" }),
  editparticipant: z.enum(["child", "parent", "volunteer"], {
    message: "Participant must be selected",
  }),
  editdue_date: z
    .string()
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      { message: "Invalid date format" }
    )
    .optional(),
});
export const addFamilyMemberSchema = z.object({
    familyMembers: z
      .array(z.boolean())
      .refine((values) => values.some((value) => value === true), {
        message: "At least one family member must be selected.",
      }),
  });
