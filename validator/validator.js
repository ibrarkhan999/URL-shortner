import z from "zod";

export const zodRegister = z.object({
  name: z.string().trim().min(3, { message: "Name must be 3 chars" }).max(30),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, { message: "password must be 6 char" }).max(30),
});

export const zodLogin = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, { message: "password must be 6 char" }).max(30),
});


export const zodEmailVerify = z.object({
  token : z.string().trim().length(8),
  email : z.string().trim(),
})